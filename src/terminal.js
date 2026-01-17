(() => {
  const $ = (s) => document.querySelector(s);

  function initTerminal() {
    const out = $("#terminal-out");
    const input = $("#terminal-in");
    const clearBtn = $("#term-clear");
    if (!out || !input) return;

    const promptBase = $("#terminal-prompt")?.textContent || "ziolken@portfolio:~$";

    function write(line, cls) {
      const div = document.createElement("div");
      if (cls) div.className = cls;
      div.textContent = line;
      out.appendChild(div);
      out.scrollTop = out.scrollHeight;
    }

    function writeRaw(html) {
      const div = document.createElement("div");
      div.innerHTML = html;
      out.appendChild(div);
      out.scrollTop = out.scrollHeight;
    }

    function help() {
      write("Commands:", "term-muted");
      write("help", "term-muted");
      write("about", "term-muted");
      write("projects", "term-muted");
      write("contact", "term-muted");
      write("play <n>", "term-muted");
      write("clear", "term-muted");
    }

    function about() {
      write("Tallinn, Estonia", "term-muted");
      write("Mostly cloudy", "term-muted");
    }

    function projects() {
      write("Featured Projects:", "term-muted");
      state.projects.forEach((p, i) => {
        write(`${i + 1}. ${p.name} (${p.badge}) - ${p.link}`, "term-muted");
      });
    }

    function contact() {
      write("Contact:", "term-muted");
      state.contacts.forEach((c) => {
        write(`${c.label}: ${c.value}`, "term-muted");
      });
    }

    function clear() {
      out.innerHTML = "";
    }

    function playN(n) {
      const audio = $("#audio");
      if (!audio) return;
      const idx = Number(n) - 1;
      if (!Number.isFinite(idx) || idx < 0 || idx >= state.tracks.length) {
        write("Invalid track number.", "term-bad");
        return;
      }
      setActiveTrack(idx);
      audio.play().then(() => write(`Playing #${idx + 1}: ${state.tracks[idx].title}`, "term-good")).catch(() => write("Cannot autoplay. Click play in the player.", "term-bad"));
    }

    function run(cmd) {
      const trimmed = cmd.trim();
      if (!trimmed) return;

      write(`${promptBase} ${trimmed}`);

      const [head, ...rest] = trimmed.split(/\s+/);
      const arg = rest.join(" ");

      if (head === "help") return help();
      if (head === "about") return about();
      if (head === "projects") return projects();
      if (head === "contact") return contact();
      if (head === "clear") return clear();
      if (head === "play") return playN(arg);

      write("Command not found. Type 'help'.", "term-bad");
    }

    writeRaw('<span class="term-muted">Type `<b>help</b>` to see commands.</span>');

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const v = input.value;
        input.value = "";
        run(v);
      }
    });

    clearBtn?.addEventListener("click", () => clear());

    setTimeout(() => input.focus(), 150);
  }

  function init() {
    initTerminal();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();