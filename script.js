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

  const music = document.getElementById('bg-music');
  const toggle = document.getElementById('music-toggle');
  const overlay = document.getElementById('enter-overlay');

  const updateMusicIcon = (isPlaying) => {
    if (isPlaying) {
      toggle.src = 'assets/music-on.PNG?v=' + new Date().getTime();
    } else {
      toggle.src = 'assets/music-off.PNG?v=' + new Date().getTime();
    }
  };

  toggle.addEventListener('click', () => {
    if (music.paused) {
      music.muted = false;
      music.play().catch(e => {
        console.log("Autoplay blocked:", e);
      });
      updateMusicIcon(true);
    } else {
      music.pause();
      updateMusicIcon(false);
    }
  });

  overlay.addEventListener('click', () => {
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.style.display = 'none';
      overlay.classList.add('hidden');
    }, 600);

    music.muted = false;
    music.play().catch(e => {
      console.log("Autoplay blocked:", e);
    });

    updateMusicIcon(true);
  });

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
