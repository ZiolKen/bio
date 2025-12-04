// --------------------------------------- © 2025 - ZiolKen • ジオルケン --------------------------------------- //

  console.log('%c░██████╗████████╗░█████╗░██████╗░██╗\n██╔════╝╚══██╔══╝██╔══██╗██╔══██╗██║\n╚█████╗░░░░██║░░░██║░░██║██████╔╝██║\n░╚═══██╗░░░██║░░░██║░░██║██╔═══╝░╚═╝\n██████╔╝░░░██║░░░╚█████╔╝██║░░░░░██╗\n╚═════╝░░░░╚═╝░░░░╚════╝░╚═╝░░░░░╚═╝', 'color: red; font-weight: bold;');

  const nameFull = "@ジオルケン";
  const descFull = "AVNs Lover.❤️❤️       ";
  const newDesc1 = "> guns.lol/_zkn <       ";
  let nameIndex = 0;
  let descIndex = 0;
  let deleting = false;
  let currentDesc = descFull;
  let changeDesc = false;

  function updateTyping() {
      if (deleting) {
          descIndex--;
          nameIndex--;
          if (descIndex <= 0) {
              deleting = false;
              changeDesc = true;
              currentDesc = (currentDesc === descFull) ? newDesc1 : descFull;
          }
      } else {
          nameIndex++;
          descIndex++;
          if (nameIndex >= nameFull.length && descIndex >= descFull.length) {
              deleting = true;
          }
      }

      document.getElementById("name-display").textContent = nameFull.slice(0, nameIndex);

      document.getElementById("desc-display").textContent = currentDesc.slice(0, descIndex);

      document.title = nameFull.slice(0, nameIndex) + " | Bio";

      requestAnimationFrame(() => setTimeout(updateTyping, deleting ? 100 : 150));  
  }
  updateTyping();

  const overlayClick = document.getElementById("enter-overlay");
  const music = document.getElementById("bg-music");
  const toggle = document.getElementById("music-toggle");
  const volumeSlider = document.getElementById("music-volume-slider");

  let lastVolume = volumeSlider.value / 100;
  music.volume = lastVolume;

  function updateIcon() {
      if (music.paused || music.volume === 0 || music.muted) {
          toggle.src = "assets/music-off.PNG";
      } else {
          toggle.src = "assets/music-on.PNG";
      }
  }

  toggle.addEventListener("click", () => {
      if (music.muted || music.volume === 0) {
        music.muted = false;
        music.volume = lastVolume || 0.5;
        volumeSlider.value = music.volume * 100; 
        music.play().catch(()=>{});
      } else {
          music.muted = true;
          lastVolume = music.volume; 
          volumeSlider.value = 0; 
          music.volume = 0;
      }
      updateIcon();
  });

  overlayClick.addEventListener("click", (e) => {
      e.stopPropagation();
      overlayClick.style.opacity = "0";

      if (music.paused) {
          music.muted = false;
          music.play().catch(() => {});
      }

      updateIcon();

      setTimeout(() => {
          overlayClick.style.display = "none";
          overlayClick.classList.add("hidden");
      }, 600);
  });

  volumeSlider.addEventListener("input", (e) => {
      e.stopPropagation();
      const v = volumeSlider.value / 100;
      music.volume = v;
      music.muted = v === 0; 
      lastVolume = v > 0 ? v : lastVolume;
      updateIcon();
  });
  
  document.getElementById("enter-overlay").addEventListener("click", function () {
    setTimeout(function () {
      document.querySelector(".overlay").classList.add("show");
    }, 150);
  });
  
          particlesJS("particles-js", {
            "particles": {
                "number": {
                    "value": 100,
                    "density": {
                        "enable": true,
                        "value_area": 800
                    }
                },
                "color": { "value": "#a855f7" },
                "shape": {
                    "type": "circle",
                    "stroke": { "width": 0, "color": "#000" }
                },
                "opacity": {
                    "value": 0.7,
                    "random": true,
                    "anim": {
                        "enable": true,
                        "speed": 0.5,
                        "opacity_min": 0.3,
                        "sync": false
                    }
                },
                "size": {
                    "value": 3,
                    "random": true,
                    "anim": {
                        "enable": true,
                        "speed": 2,
                        "size_min": 0.3,
                        "sync": false
                    }
                },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": "#a855f7",
                    "opacity": 0.3,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 1.5,
                    "direction": "none",
                    "random": false,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": { "enable": true, "mode": "repulse" },
                    "onclick": { "enable": false },
                    "resize": true
                },
                "modes": {
                    "repulse": { "distance": 100, "duration": 0.4 }
                }
            },
            "retina_detect": true
        });

// -------------------------- ███████╗██╗░█████╗░██╗░░░░░██╗░░██╗███████╗███╗░░██╗ -------------------------- //
// -------------------------- ╚════██║██║██╔══██╗██║░░░░░██║░██╔╝██╔════╝████╗░██║ -------------------------- //
// -------------------------- ░░███╔═╝██║██║░░██║██║░░░░░█████═╝░█████╗░░██╔██╗██║ -------------------------- //
// -------------------------- ██╔══╝░░██║██║░░██║██║░░░░░██╔═██╗░██╔══╝░░██║╚████║ -------------------------- //
// -------------------------- ███████╗██║╚█████╔╝███████╗██║░╚██╗███████╗██║░╚███║ -------------------------- //
// -------------------------- ╚══════╝╚═╝░╚════╝░╚══════╝╚═╝░░╚═╝╚══════╝╚═╝░░╚══╝ -------------------------- //

  const pulse = document.createElement("div");
  pulse.classList.add("cursor-pulse");
  document.body.appendChild(pulse);

  document.addEventListener("mousemove", (e) => {

    pulse.style.left = e.pageX + "px";
    pulse.style.top = e.pageY + "px";

    const snowflake = document.createElement("div");
    snowflake.textContent = "❄"; 
    snowflake.style.position = "fixed";
    snowflake.style.left = e.pageX + "px";
    snowflake.style.top = e.pageY + "px";
    snowflake.style.fontSize = Math.random() * 10 + 10 + "px";
    snowflake.style.opacity = 0.8;
    snowflake.style.pointerEvents = "none";
    snowflake.style.color = "#fff";
    snowflake.style.animation = "fall 2s linear forwards";

    document.body.appendChild(snowflake);

    setTimeout(() => snowflake.remove(), 3000);
  });

  const style = document.createElement("style");
  style.textContent = `
  @keyframes fall {
    to {
      transform: translateY(300px) rotate(360deg);
      opacity: 0;
    }
  }`;
  document.head.appendChild(style);

  async function fetchDiscordStatus() {
    try {
      const res = await fetch("https://api.lanyard.rest/v1/users/951037699320602674");
      const { data, success } = await res.json();

      if (!success || !data) {
        document.getElementById("discord-avatar").src = "assets/loading.gif";
        document.getElementById("discord-username").innerText = "Offline";
        document.getElementById("discord-activity").innerText = "Offline";
        document.getElementById("discord-status-dot").style.backgroundColor = "#747f8d";
        return;
      }

      if (data.discord_user.avatar) {
        document.getElementById("discord-avatar").src =
          `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.png?size=128`;
      }

      const globalName = data.discord_user.global_name || "";
      const userTag = "@" + data.discord_user.username;
      document.getElementById("discord-username").innerText = globalName + " (" + userTag + ")";

      const statusColorMap = {
        online: "#02c46c",
        idle: "#faa61a",
        dnd: "#f04747",
        offline: "#747f8d"
      };
      document.getElementById("discord-status-dot").style.backgroundColor =
        statusColorMap[data.discord_status] || "#747f8d";

      let activityText = "";

      const custom = data.activities.find(a => a.type === 4);
      if (custom) {
        activityText = (custom.emoji ? custom.emoji.name + " " : "") + (custom.state || "");
      }

      if (!activityText && data.listening_to_spotify && data.spotify) {
        activityText = `🎵 ${data.spotify.song} - ${data.spotify.artist}`;
      }

      if (!activityText && data.activities.length > 0) {
        const game = data.activities.find(a => a.type === 0);
        if (game) activityText = `🎮 ${game.name}`;
      }

      if (!activityText) {
        const statusTextMap = {
          online: "🟢 Online",
          idle: "🌙 Idle",
          dnd: "⛔️ Do Not Disturb",
          offline: "⚫️ Offline"
        };
        activityText = statusTextMap[data.discord_status] || "Unknown";
      }

      document.getElementById("discord-activity").innerText = activityText;

    } catch (err) {
      console.error(err);
      document.getElementById("discord-avatar").src = "assets/loading.gif";
      document.getElementById("discord-username").innerText = "Error";
      document.getElementById("discord-activity").innerText = "Error fetching status";
      document.getElementById("discord-status-dot").style.backgroundColor = "#747f8d";
    }
  }

  fetchDiscordStatus();
  setInterval(fetchDiscordStatus, 5000);

  window.addEventListener("DOMContentLoaded", () => {
    const bgm = document.getElementById("bg-music");
    bgm.addEventListener("play", () => {
      bgm.volume = 0.2;
    });
  });

  const card = document.querySelector('.overlay');
  card.addEventListener('mousemove', (e) => {
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  card.style.setProperty('--x', `${x}px`);
  card.style.setProperty('--y', `${y}px`);
  card.style.setProperty("--rx", rotateX + "deg");
  card.style.setProperty("--ry", rotateY + "deg");
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const rotateX = ((y - centerY) / centerY) * 10;
  const rotateY = ((x - centerX) / centerX) * -10;
  card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  const angle = 135 + rotateX - rotateY;
  card.style.setProperty('--angle', `${angle}deg`);
  });
  card.addEventListener('mouseleave', () => {
  card.style.transform = `rotateX(0deg) rotateY(0deg)`;
  card.style.setProperty('--angle', `135deg`);
  });

// --------------------------------------- © 2025 - ZiolKen • ジオルケン --------------------------------------- //