(() => {
  const $ = (s) => document.querySelector(s);

  function initTerminal() {
    const out = $("#terminal-out");
    const input = $("#terminal-in");
    const terminalRoot = out?.closest(".terminal");
    if (!out || !input || !terminalRoot) return;

    const promptBase = $("#terminal-prompt")?.textContent?.trim() || "root@ziolken $";

    const state = {
      theme: localStorage.getItem("portfolio_term_theme") || "night",
      history: loadHistory(),
      histIdx: -1,
      commands: new Map(),
      aliases: new Map([["cls","clear"],["ls","projects"],["?","help"]]),
      projects: (window.portfolioState?.projects) || (window.state?.projects) || [],
      tracks: (window.portfolioState?.tracks) || (window.state?.tracks) || [],
      contacts: (window.portfolioState?.contacts) || (window.state?.contacts) || parseContactsFromDOM(),
    };

    function scrollBottom(){ out.scrollTop = out.scrollHeight; }

    function write(line, cls){
      const div = document.createElement("div");
      if (cls) div.className = cls;
      div.textContent = line;
      out.appendChild(div);
      scrollBottom();
    }

    function writeHTML(html, cls){
      const div = document.createElement("div");
      if (cls) div.className = cls;
      div.innerHTML = html;
      out.appendChild(div);
      scrollBottom();
    }

    function hr(){
      const div = document.createElement("div");
      div.className = "term-hr";
      div.innerHTML = "<span></span>";
      out.appendChild(div);
      scrollBottom();
    }

    function printTable(rows){
      const table = document.createElement("div");
      table.className = "term-table";
      rows.forEach((r, idx) => {
        const row = document.createElement("div");
        row.className = "term-row" + (idx === 0 ? " term-head" : "");
        r.forEach((c) => {
          const cell = document.createElement("div");
          cell.className = "term-cell";
          cell.textContent = c;
          row.appendChild(cell);
        });
        table.appendChild(row);
      });
      out.appendChild(table);
      scrollBottom();
    }

    const HISTORY_KEY = "portfolio_term_history_v2";
    const MAX_HISTORY = 80;

    function loadHistory(){
      try{
        const raw = localStorage.getItem(HISTORY_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr : [];
      }catch{ return []; }
    }
    function saveHistory(){
      try{ localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history.slice(-MAX_HISTORY))); }catch{}
    }
    function pushHistory(cmd){
      const c = cmd.trim();
      if (!c) return;
      if (state.history[state.history.length - 1] !== c) state.history.push(c);
      state.history = state.history.slice(-MAX_HISTORY);
      saveHistory();
      state.histIdx = -1;
    }
    function histUp(){
      if (!state.history.length) return;
      if (state.histIdx === -1) state.histIdx = state.history.length - 1;
      else state.histIdx = Math.max(0, state.histIdx - 1);
      input.value = state.history[state.histIdx] || "";
      moveCaretEnd();
    }
    function histDown(){
      if (!state.history.length) return;
      if (state.histIdx === -1) return;
      state.histIdx = Math.min(state.history.length, state.histIdx + 1);
      input.value = state.history[state.histIdx] || "";
      moveCaretEnd();
      if (state.histIdx >= state.history.length) state.histIdx = -1;
    }
    function moveCaretEnd(){
      requestAnimationFrame(() => {
        input.selectionStart = input.selectionEnd = input.value.length;
      });
    }

    function tokenize(str){
      const out = [];
      let cur = "", inQ = false, q = "";
      for (let i=0;i<str.length;i++){
        const ch = str[i];
        if (!inQ && (ch === '"' || ch === "'")) { inQ = true; q = ch; continue; }
        if (inQ && ch === q) { inQ = false; q = ""; continue; }
        if (!inQ && /\s/.test(ch)) { if (cur) out.push(cur), cur=""; continue; }
        cur += ch;
      }
      if (cur) out.push(cur);
      return out;
    }

    function resolveAlias(head, args){
      const a = state.aliases.get(head);
      if (!a) return { head, args };
      const parts = tokenize(a);
      return { head: parts[0], args: [...parts.slice(1), ...args] };
    }

    function applyTheme(t){
      state.theme = t;
      localStorage.setItem("portfolio_term_theme", t);
      terminalRoot.setAttribute("data-theme", t);
    }
    applyTheme(state.theme);

    function register(cmd){
      state.commands.set(cmd.name, cmd);
      (cmd.aliases || []).forEach((a) => state.aliases.set(a, cmd.name));
    }

    function cmdList(){
      const rows = [["CMD","USAGE","DESC","HINT"]];
      [...state.commands.values()]
        .sort((a,b) => a.name.localeCompare(b.name))
        .forEach((c) => rows.push([c.name, c.usage || c.name, c.desc || "", c.hint || ""]));
      printTable(rows);
    }

    register({
      name:"help",
      usage:"help [cmd]",
      desc:"Show commands / help.",
      hint:"try: help projects",
      run: ({args}) => {
        const q = args[0];
        if (!q) return cmdList();
        const c = state.commands.get(q);
        if (!c) return write(`No help for: ${q}`, "term-bad");
        hr();
        write(`${c.name} — ${c.desc || ""}`, "term-muted");
        write(`Usage: ${c.usage || c.name}`, "term-muted");
        if (c.examples?.length){
          write("Examples:", "term-muted");
          c.examples.forEach((x) => write(`  ${x}`, "term-muted"));
        }
      }
    });

    register({
      name:"clear",
      usage:"clear",
      desc:"Clear screen.",
      run: () => (out.innerHTML = "")
    });

    register({
      name:"banner",
      usage:"banner",
      desc:"Show banner.",
      run: () => {
        writeHTML(
          `<pre class="term-banner">  ____  _       _ _              \n |  _ \\(_) ___ | | | _____ _ __  \n | |_) | |/ _ \\| | |/ / _ \\ '__| \n |  __/| | (_) | |   <  __/ |    \n |_|   |_|\\___/|_|_|\\_\\___|_|    \n</pre>`
        );
        writeHTML(
          `<span class="term-chip" data-cmd="projects">projects</span>
           <span class="term-chip" data-cmd="contact">contact</span>
           <span class="term-chip" data-cmd="theme matrix">theme matrix</span>`,
          "term-muted"
        );
      }
    });

    register({
      name:"whoami",
      usage:"whoami",
      desc:"Print identity.",
      run: () => write("@ziolken", "term-good")
    });

    register({
      name:"date",
      usage:"date",
      desc:"Show current date/time.",
      run: () => write(new Date().toString(), "term-muted")
    });

    register({
      name:"about",
      usage:"about",
      desc:"About me (short).",
      run: () => {
        write("ZiolKen — random guy on internet 🌏", "term-muted");
        write("Interests: gaming • coding • car • avn • wasting time", "term-muted");
      }
    });

    register({
      name:"theme",
      usage:"theme [night|mono|matrix|glass]",
      desc:"Change terminal theme.",
      examples:["theme matrix","theme glass"],
      run: ({args}) => {
        const t = (args[0] || "").toLowerCase();
        if (!t){
          write(`Current theme: ${state.theme}`, "term-muted");
          write("Available: night, mono, matrix, glass", "term-muted");
          return;
        }
        if (!["night","mono","matrix","glass"].includes(t)){
          write("Invalid theme.", "term-bad");
          return;
        }
        applyTheme(t);
        write(`Theme set to: ${t}`, "term-good");
      }
    });

    register({
      name:"projects",
      usage:"projects",
      desc:"List projects.",
      hint:"open 1",
      run: () => {
        if (!state.projects.length){
          write("No projects found. Tip: set window.portfolioState.projects", "term-bad");
          return;
        }
        const rows = [["#","NAME","BADGE","LINK"]];
        state.projects.forEach((p,i) => rows.push([
          String(i+1),
          p.name || "-",
          p.badge || "-",
          p.link || "-"
        ]));
        printTable(rows);
        write("Tip: open <n>", "term-muted");
      }
    });

    register({
      name:"open",
      usage:"open <n>",
      desc:"Open project by index.",
      examples:["open 1","open 2"],
      run: ({args}) => {
        const idx = Number(args[0]) - 1;
        const p = state.projects[idx];
        if (!p?.link) return write("Invalid project number.", "term-bad");
        window.open(p.link, "_blank", "noopener,noreferrer");
        write(`Opened: ${p.name}`, "term-good");
      }
    });

    register({
      name:"contact",
      usage:"contact",
      desc:"Show contacts (parsed from DOM).",
      hint:"copy email",
      run: () => {
        if (!state.contacts.length){
          write("No contacts found.", "term-bad");
          return;
        }
        const rows = [["KEY","LABEL","VALUE","URL"]];
        state.contacts.forEach((c) => rows.push([
          c.key || "-",
          c.label || "-",
          c.value || "-",
          c.url || "-"
        ]));
        printTable(rows);
        write("Tip: copy <key>", "term-muted");
      }
    });

    register({
      name:"copy",
      usage:"copy <key>",
      desc:"Copy contact value.",
      examples:["copy email","copy telegram"],
      run: async ({args}) => {
        const k = (args[0] || "").toLowerCase();
        if (!k) return write("Usage: copy <key>", "term-bad");
        const c = state.contacts.find((x) => (x.key || "").toLowerCase() === k);
        if (!c?.value) return write("Not found. Try: contact", "term-bad");
        try{
          await navigator.clipboard.writeText(c.value);
          write(`Copied: ${c.label}`, "term-good");
        }catch{
          write("Clipboard blocked by browser.", "term-bad");
        }
      }
    });

    register({
      name:"echo",
      usage:"echo <text>",
      desc:"Print text.",
      run: ({args}) => write(args.join(" "), "term-muted")
    });

    register({
      name:"play",
      usage:"play <n>",
      desc:"Play track number n (if you have #audio).",
      run: ({args}) => playN(args[0])
    });

    function playN(n){
      const audio = $("#audio");
      if (!audio) return write("Audio element not found.", "term-bad");
      const idx = Number(n) - 1;
      if (!Number.isFinite(idx) || idx < 0 || idx >= state.tracks.length){
        write("Invalid track number.", "term-bad");
        return;
      }
      if (typeof window.setActiveTrack === "function") window.setActiveTrack(idx);
      audio.play()
        .then(() => write(`Playing #${idx+1}: ${state.tracks[idx].title}`, "term-good"))
        .catch(() => write("Cannot autoplay. Click play in the player.", "term-bad"));
    }

    function autocomplete(){
      const v = input.value.trim();
      const parts = tokenize(v);
      if (!parts.length) return;

      if (parts.length === 1){
        const head = parts[0];
        const names = [...new Set([...state.commands.keys(), ...state.aliases.keys()])]
          .filter((x) => x.startsWith(head))
          .sort();
        if (names.length === 1) input.value = names[0] + " ";
        else if (names.length > 1) write(names.join("  "), "term-muted");
        return;
      }
    }

    async function run(cmd){
      const trimmed = cmd.trim();
      if (!trimmed) return;

      pushHistory(trimmed);
      write(`${promptBase} ${trimmed}`);

      const tokens = tokenize(trimmed);
      let head = tokens[0];
      let args = tokens.slice(1);

      ({head, args} = resolveAlias(head, args));

      const c = state.commands.get(head);
      if (!c){
        write(`Command not found: ${head}. Type 'help'.`, "term-bad");
        return;
      }

      try{
        await c.run({ args, write, writeHTML, printTable, hr, state });
      }catch(e){
        write("Error running command.", "term-bad");
        write(String(e?.message || e), "term-bad");
      }
    }

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter"){
        const v = input.value;
        input.value = "";
        run(v);
        return;
      }
      if (e.key === "ArrowUp"){ e.preventDefault(); histUp(); return; }
      if (e.key === "ArrowDown"){ e.preventDefault(); histDown(); return; }
      if (e.key === "Tab"){ e.preventDefault(); autocomplete(); return; }
      if (e.key === "Escape"){ input.value = ""; return; }
    });

    terminalRoot.addEventListener("mousedown", () => input.focus());

    out.addEventListener("click", (e) => {
      const el = e.target.closest("[data-cmd]");
      if (!el) return;
      const cmd = el.getAttribute("data-cmd");
      if (cmd) run(cmd);
    });

    writeHTML(
      `<span class="term-muted">Type <b>help</b> • <b>banner</b> • <b>projects</b> • <b>contact</b> • <b>theme matrix</b></span>`
    );
    setTimeout(() => input.focus(), 120);

    function parseContactsFromDOM(){
      const list = $("#contact-list");
      if (!list) return [];
      const items = [...list.querySelectorAll("a.contact-item")];
      return items.map((a) => {
        const label = a.querySelector(".contact-left span")?.textContent?.trim() || "Contact";
        const value = a.querySelector(".contact-right")?.textContent?.replace("→","")?.trim() || a.getAttribute("href") || "";
        const href = a.getAttribute("href") || "";
        const key = label.toLowerCase().replace(/\s+/g,"");
        const url = href.startsWith("http") || href.startsWith("mailto:") ? href : "";
        return { key, label, value, url };
      });
    }
  }

  function init(){
    initTerminal();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();