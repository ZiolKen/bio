(() => {
  const $ = (s, r = document) => r.querySelector(s);

  const musicRoot =
    document.querySelector('.row-span-2.md\\:col-span-1.lg\\:col-span-1.lg\\:row-span-2') ||
    document.querySelector('.row-span-2.md\\:col-span-1') ||
    document.querySelector('.row-span-2');

  const projectsGrid = $('#projects-grid');

  if (musicRoot && !musicRoot.id) musicRoot.id = 'music-card';
  if (projectsGrid && !projectsGrid.id) projectsGrid.id = 'projects-grid';
  
  window.musicTracks = [
    { title: "Bloody Moon", artist: "Unknown", src: "assets/bloody_moon.mp3", cover: "res/music.png", dur: "2:29" },
    { title: "Empire", artist: "Ogryzek", src: "assets/empire.mp3", cover: "res/empire.jpeg", dur: "1:37" },
  ];

  const tracks = window.musicTracks || [];

  const audio = $("#audio");
  const list = $("#music-list");
  const titleEl = $("#music-title");
  const artistEl = $("#music-artist");
  const coverEl = $("#music-cover-img");
  const fillEl = $("#music-bar-fill");
  const curEl = $("#music-cur");
  const durEl = $("#music-dur");
  const badgeEl = $("#music-badge");

  const playBtn = $("#music-play");
  const toggleBtn = $("#music-toggle");
  const prevBtn = $("#music-prev");
  const nextBtn = $("#music-next");
  const backBtn = $("#music-back");
  const forwardBtn = $("#music-forward");
  const shuffleBtn = $("#music-shuffle");
  const loopBtn = $("#music-loop");

  if (!audio || !list || !playBtn) return;

  let idx = 0;
  let shuffled = false;
  let loop = false;
  let order = tracks.map((_, i) => i);

  function fmt(t){
    if (!Number.isFinite(t) || t < 0) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${String(s).padStart(2,"0")}`;
  }

  function rebuildOrder(){
    order = tracks.map((_, i) => i);
    if (!shuffled) return;
    for (let i = order.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
  }

  function setActive(realIndex, autoplay=false){
    idx = realIndex;
    const t = tracks[idx];
    if (!t) return;

    audio.src = t.src;
    titleEl.textContent = t.title || "Unknown";
    artistEl.textContent = t.artist || "Unknown";
    coverEl.src = t.cover || "res/music.png";

    [...list.querySelectorAll(".music-item")].forEach((el) => {
      el.classList.toggle("active", Number(el.dataset.i) === idx);
    });

    fillEl.style.width = "0%";
    curEl.textContent = "0:00";
    durEl.textContent = t.dur || "0:00";
    badgeEl.textContent = "00:00";

    if (autoplay) audio.play().catch(() => {});
    syncPlayUI();
  }

  function syncPlayUI(){
    const playing = !audio.paused;
    playBtn.textContent = playing ? "⏸" : "▶";
    toggleBtn.textContent = playing ? "Pause" : "Play";
  }

  function next(){
    if (!tracks.length) return;
    const currentPos = order.indexOf(idx);
    const nextPos = (currentPos + 1) % order.length;
    setActive(order[nextPos], true);
  }

  function prev(){
    if (!tracks.length) return;
    const currentPos = order.indexOf(idx);
    const prevPos = (currentPos - 1 + order.length) % order.length;
    setActive(order[prevPos], true);
  }

  function renderList(){
    list.innerHTML = "";
    tracks.forEach((t, i) => {
      const item = document.createElement("div");
      item.className = "music-item";
      item.dataset.i = String(i);
      item.innerHTML = `
        <div class="music-item-left">
          <div class="music-item-title"></div>
          <div class="music-item-artist"></div>
        </div>
        <div class="music-item-right"></div>
      `;
      item.querySelector(".music-item-title").textContent = t.title || "Unknown";
      item.querySelector(".music-item-artist").textContent = t.artist || "Unknown";
      item.querySelector(".music-item-right").textContent = t.dur || "";
      item.addEventListener("click", () => setActive(i, true));
      list.appendChild(item);
    });
  }

  playBtn.addEventListener("click", () => {
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
    syncPlayUI();
  });
  toggleBtn.addEventListener("click", () => playBtn.click());
  prevBtn.addEventListener("click", prev);
  nextBtn.addEventListener("click", next);
  backBtn.addEventListener("click", () => { audio.currentTime = Math.max(0, audio.currentTime - 10); });
  forwardBtn.addEventListener("click", () => { audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10); });

  shuffleBtn.addEventListener("click", () => {
    shuffled = !shuffled;
    shuffleBtn.classList.toggle("is-on", shuffled);
    rebuildOrder();
  });

  loopBtn.addEventListener("click", () => {
    loop = !loop;
    loopBtn.classList.toggle("is-on", loop);
    audio.loop = loop;
  });

  audio.addEventListener("play", syncPlayUI);
  audio.addEventListener("pause", syncPlayUI);

  audio.addEventListener("timeupdate", () => {
    const d = audio.duration || 0;
    const c = audio.currentTime || 0;
    const pct = d ? (c / d) * 100 : 0;
    fillEl.style.width = `${pct}%`;
    curEl.textContent = fmt(c);
    badgeEl.textContent = fmt(c);
    if (d) durEl.textContent = fmt(d);
  });

  audio.addEventListener("ended", () => {
    if (!loop) next();
  });

  renderList();
  rebuildOrder();
  setActive(0, false);

  const FeaturedProjects = (() => {
    if (!projectsGrid) return null;

    projectsGrid.style.display = 'flex';
    projectsGrid.style.gap = '12px';
    projectsGrid.style.overflowX = 'auto';
    projectsGrid.style.overflowY = 'hidden';
    projectsGrid.style.paddingBottom = '6px';
    projectsGrid.style.webkitOverflowScrolling = 'touch';

    const owner = 'ZiolKen';
    const apiUrl = `https://api.github.com/users/${owner}/repos?per_page=100&sort=updated`;
    const cacheKey = `gh_deployed_${owner}_v1`;
    const cacheTtlMs = 10 * 60 * 1000;

    const escapeHtml = (s) =>
      String(s ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');

    const formatNum = (n) => {
      const x = Number(n) || 0;
      if (x >= 1_000_000) return `${(x / 1_000_000).toFixed(x % 1_000_000 === 0 ? 0 : 1)}M`;
      if (x >= 1_000) return `${(x / 1_000).toFixed(x % 1_000 === 0 ? 0 : 1)}K`;
      return `${x}`;
    };

    const readCache = () => {
      try {
        const raw = localStorage.getItem(cacheKey);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed?.ts || !Array.isArray(parsed?.data)) return null;
        if (Date.now() - parsed.ts > cacheTtlMs) return null;
        return parsed.data;
      } catch (_) {
        return null;
      }
    };

    const writeCache = (data) => {
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data }));
      } catch (_) {}
    };

    const isDeployed = (r) => {
      const home = (r.homepage || '').trim();
      return Boolean(home) || Boolean(r.has_pages);
    };

    const liveUrlOf = (r) => {
      const home = (r.homepage || '').trim();
      if (home) return home;
      if (r.has_pages) return `https://${owner.toLowerCase()}.github.io/${r.name}/`;
      return '';
    };

    const cardHtml = (r) => {
      const name = escapeHtml(r.name);
      const desc = escapeHtml(r.description || 'No description');
      const lang = escapeHtml(r.language || '');
      const url = escapeHtml(r.html_url || '#');
      const stars = formatNum(r.stargazers_count);
      const forks = formatNum(r.forks_count);
      const live = escapeHtml(liveUrlOf(r));

      return `
        <a class="project-card" href="${url}" target="_blank" rel="noreferrer" style="flex:0 0 auto; min-width:280px; max-width:340px;">
          <div class="project-card-head">
            <div class="project-name">${name}</div>
            <div class="project-metrics">
              <span class="metric" title="Stars">★ ${stars}</span>
              <span class="metric" title="Forks">⑂ ${forks}</span>
            </div>
          </div>
          <div class="project-desc">${desc}</div>
          <div class="project-foot">
            ${lang ? `<span class="chip">${lang}</span>` : `<span></span>`}
            ${live ? `<span class="chip link" data-live="${live}">Live</span>` : ``}
          </div>
        </a>
      `;
    };

    const setLoading = () => {
      projectsGrid.innerHTML = `
        <div class="project-card skeleton" style="flex:0 0 auto; min-width:280px; height:120px;"></div>
        <div class="project-card skeleton" style="flex:0 0 auto; min-width:280px; height:120px;"></div>
        <div class="project-card skeleton" style="flex:0 0 auto; min-width:280px; height:120px;"></div>
      `;
    };

    const setError = () => {
      projectsGrid.innerHTML = `
        <div class="project-card error" style="flex:0 0 auto; min-width:280px;">
          <div class="project-name">Failed to load projects</div>
          <div class="project-desc">GitHub API rate limit or network error.</div>
        </div>
      `;
    };

    const fetchRepos = async () => {
      const cached = readCache();
      if (cached) return cached;

      const res = await fetch(apiUrl, { headers: { Accept: 'application/vnd.github+json' } });
      if (!res.ok) throw new Error('GitHub API error');
      const data = await res.json();
      writeCache(data);
      return data;
    };

    const render = async () => {
      setLoading();
      try {
        const repos = await fetchRepos();
        const list = repos
          .filter((r) => !r.fork && !r.archived)
          .filter(isDeployed)
          .sort((a, b) => new Date(b.pushed_at || b.updated_at || 0) - new Date(a.pushed_at || a.updated_at || 0))
          .slice(0, 5);

        projectsGrid.innerHTML = list.map(cardHtml).join('');

        projectsGrid.addEventListener(
          'click',
          (e) => {
            const chip = e.target?.closest?.('.chip.link[data-live]');
            if (!chip) return;
            const live = chip.getAttribute('data-live');
            if (!live) return;
            e.preventDefault();
            window.open(live, '_blank', 'noopener,noreferrer');
          },
          { passive: false }
        );
      } catch (_) {
        setError();
      }
    };

    render();
    return { render };
  })();

  window.__ziolken = { MusicPlayer, FeaturedProjects };
})();