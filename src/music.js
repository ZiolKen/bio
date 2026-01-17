(() => {
  const elCard = document.getElementById("music-card");
  if (!elCard) return;

  const elAudio = document.getElementById("music-audio");
  const elCover = document.getElementById("music-cover-img");
  const elTitle = document.getElementById("music-title");
  const elArtist = document.getElementById("music-artist");
  const elPrev = document.getElementById("music-prev");
  const elNext = document.getElementById("music-next");
  const elPlay = document.getElementById("music-play");
  const elMute = document.getElementById("music-mute");
  const elProgress = document.getElementById("music-progress");
  const elFill = document.getElementById("music-progress-fill");
  const elKnob = document.getElementById("music-progress-knob");
  const bars = Array.from(elMute.querySelectorAll(".mvb"));

  const tracks = [
    {
      title: "Bloody Moon",
      artist: "Unknown",
      src: "assets/bloody_moon.mp3",
      cover: "res/music.png"
    }
  ];

  let idx = 0;
  let dragging = false;
  let ctx = null;
  let analyser = null;
  let data = null;
  let raf = 0;
  let wired = false;

  const fmt = (s) => {
    if (!isFinite(s) || s < 0) return "0:00";
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return `${m}:${String(r).padStart(2, "0")}`;
  };

  const load = (i) => {
    idx = (i + tracks.length) % tracks.length;
    const t = tracks[idx];
    elTitle.textContent = t.title || "";
    elArtist.textContent = t.artist || "";
    elCover.src = t.cover || "";
    elAudio.src = t.src || "";
    elFill.style.width = "0%";
    elKnob.style.left = "0%";
  };

  const ensureAudioGraph = () => {
    if (wired) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const src = ctx.createMediaElementSource(elAudio);
    analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    data = new Uint8Array(analyser.frequencyBinCount);
    src.connect(analyser);
    analyser.connect(ctx.destination);
    wired = true;
  };

  const setProgressByRatio = (r) => {
    const ratio = Math.min(1, Math.max(0, r));
    const dur = elAudio.duration || 0;
    if (dur > 0) elAudio.currentTime = dur * ratio;
    const pct = ratio * 100;
    elFill.style.width = `${pct}%`;
    elKnob.style.left = `${pct}%`;
  };

  const pointerRatio = (e) => {
    const rect = elProgress.getBoundingClientRect();
    const x = (e.clientX ?? (e.touches && e.touches[0] && e.touches[0].clientX) ?? 0) - rect.left;
    return x / rect.width;
  };

  const syncProgress = () => {
    if (dragging) return;
    const dur = elAudio.duration || 0;
    const cur = elAudio.currentTime || 0;
    const ratio = dur > 0 ? cur / dur : 0;
    const pct = ratio * 100;
    elFill.style.width = `${pct}%`;
    elKnob.style.left = `${pct}%`;
  };

  const stopViz = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    bars.forEach((b) => (b.style.height = "10px"));
  };

  const viz = () => {
    if (!analyser || !data) return;
    analyser.getByteFrequencyData(data);

    const n = data.length;
    const picks = [0.05, 0.12, 0.2, 0.32, 0.5, 0.72].map((p) => Math.min(n - 1, Math.floor(n * p)));
    const maxH = 28;
    const minH = 8;

    for (let i = 0; i < bars.length; i++) {
      const v = data[picks[i]] / 255;
      const h = Math.round(minH + v * (maxH - minH));
      bars[i].style.height = `${h}px`;
    }

    raf = requestAnimationFrame(viz);
  };

  const play = async () => {
    ensureAudioGraph();
    if (ctx && ctx.state === "suspended") await ctx.resume();
    await elAudio.play();
  };

  const pause = () => elAudio.pause();

  const toggle = async () => {
    if (elAudio.paused) await play();
    else pause();
  };

  elPrev.addEventListener("click", async () => {
    const wasPlaying = !elAudio.paused;
    load(idx - 1);
    if (wasPlaying) await play();
  });

  elNext.addEventListener("click", async () => {
    const wasPlaying = !elAudio.paused;
    load(idx + 1);
    if (wasPlaying) await play();
  });

  elPlay.addEventListener("click", toggle);

  elMute.addEventListener("click", () => {
    elAudio.muted = !elAudio.muted;
    elCard.classList.toggle("is-muted", elAudio.muted);
  });

  elProgress.addEventListener("pointerdown", (e) => {
    dragging = true;
    elProgress.setPointerCapture(e.pointerId);
    setProgressByRatio(pointerRatio(e));
  });

  elProgress.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    setProgressByRatio(pointerRatio(e));
  });

  elProgress.addEventListener("pointerup", () => {
    dragging = false;
  });

  elProgress.addEventListener("keydown", (e) => {
    const dur = elAudio.duration || 0;
    if (!dur) return;
    if (e.key === "ArrowLeft") elAudio.currentTime = Math.max(0, elAudio.currentTime - 5);
    if (e.key === "ArrowRight") elAudio.currentTime = Math.min(dur, elAudio.currentTime + 5);
  });

  elAudio.addEventListener("timeupdate", syncProgress);

  elAudio.addEventListener("play", () => {
    elCard.classList.add("is-playing");
    viz();
  });

  elAudio.addEventListener("pause", () => {
    elCard.classList.remove("is-playing");
    stopViz();
  });

  elAudio.addEventListener("ended", async () => {
    load(idx + 1);
    await play();
  });

  load(0);

  if (!elTitle.textContent) elTitle.textContent = "Unknown";
  if (!elArtist.textContent) elArtist.textContent = "Unknown";
})();
