(() => {
  const $ = (s, root = document) => root.querySelector(s);

  function tokenize(input) {
    const s = (input ?? "").trim();
    if (!s) return [];
    const tokens = [];
    let cur = "";
    let quote = null;
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (quote) {
        if (ch === "\\" && i + 1 < s.length) {
          cur += s[++i];
          continue;
        }
        if (ch === quote) {
          quote = null;
          continue;
        }
        cur += ch;
        continue;
      }
      if (ch === "'" || ch === '"') {
        quote = ch;
        continue;
      }
      if (/\s/.test(ch)) {
        if (cur) tokens.push(cur), (cur = "");
        continue;
      }
      cur += ch;
    }
    if (cur) tokens.push(cur);
    return tokens;
  }

  function isNearBottom(el, threshold = 24) {
    return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  }

  function safeText(node, text) {
    node.textContent = text == null ? "" : String(text);
  }

  function makeSafeLink(href, label) {
    try {
      const u = new URL(href, location.href);
      const ok = ["http:", "https:", "mailto:"].includes(u.protocol);
      if (!ok) return null;
      const a = document.createElement("a");
      a.href = u.href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.className = "term-link";
      a.textContent = label ?? u.href;
      return a;
    } catch {
      return null;
    }
  }

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function wmoDesc(code) {
    const c = Number(code);
    const map = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Depositing rime fog",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      56: "Light freezing drizzle",
      57: "Dense freezing drizzle",
      61: "Slight rain",
      63: "Moderate rain",
      65: "Heavy rain",
      66: "Light freezing rain",
      67: "Heavy freezing rain",
      71: "Slight snow fall",
      73: "Moderate snow fall",
      75: "Heavy snow fall",
      77: "Snow grains",
      80: "Slight rain showers",
      81: "Moderate rain showers",
      82: "Violent rain showers",
      85: "Slight snow showers",
      86: "Heavy snow showers",
      95: "Thunderstorm",
      96: "Thunderstorm with slight hail",
      99: "Thunderstorm with heavy hail",
    };
    return map[c] ?? `Weather code ${c}`;
  }

  class WebTerminal {
    constructor(opts) {
      this.out = opts.out;
      this.input = opts.input;
      this.clearBtn = opts.clearBtn ?? null;
      this.promptEl = opts.promptEl ?? null;
      this.root = opts.root ?? this.out.closest("#terminal") ?? this.out.parentElement ?? document.body;
      this.maxLines = opts.maxLines ?? 500;
      this.persistKey = opts.persistKey ?? "webterm.history";
      this.getPrompt = opts.getPrompt ?? (() => this.promptEl?.textContent || "user@site:~$");
      this.onCommand = opts.onCommand ?? (async () => {});
      this.history = this._loadHistory();
      this.hIndex = this.history.length;
      this.completions = opts.completions ?? (() => []);
      this._tabCycle = { base: "", list: [], idx: 0 };
      this._bind();
    }

    _bind() {
      this.input.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const v = this.input.value;
          this.input.value = "";
          await this.run(v);
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          this._historyUp();
          return;
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          this._historyDown();
          return;
        }
        if (e.key === "Tab") {
          e.preventDefault();
          this._autocomplete();
          return;
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === "l" || e.key === "L")) {
          e.preventDefault();
          this.clear();
          return;
        }
      });

      this.out.addEventListener("mousedown", () => this.focus());
      this.out.addEventListener(
        "wheel",
        (e) => {
          const el = this.out;
          const canScroll = el.scrollHeight > el.clientHeight + 1;
          if (!canScroll) return;
      
          const atTop = el.scrollTop <= 0;
          const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
          const up = e.deltaY < 0;
      
          if ((up && !atTop) || (!up && !atBottom)) {
            e.stopPropagation();
            e.preventDefault();
            el.scrollTop += e.deltaY;
          }
        },
        { passive: false }
      );
      this.clearBtn?.addEventListener("click", () => this.clear());
      setTimeout(() => this.focus(), 150);
    }

    focus() {
      this.input?.focus();
    }

    clear() {
      this.out.innerHTML = "";
    }

    println(text = "", cls) {
      const shouldStick = isNearBottom(this.out);
      const div = document.createElement("div");
      if (cls) div.className = cls;
      safeText(div, text);
      this.out.appendChild(div);
      this._trimLines();
      if (shouldStick) this.out.scrollTop = this.out.scrollHeight;
    }

    printNode(node, cls) {
      const shouldStick = isNearBottom(this.out);
      const div = document.createElement("div");
      if (cls) div.className = cls;
      div.appendChild(node);
      this.out.appendChild(div);
      this._trimLines();
      if (shouldStick) this.out.scrollTop = this.out.scrollHeight;
    }

    echoCommand(cmd) {
      this.println(`${this.getPrompt()} ${cmd}`);
    }

    _trimLines() {
      const extra = this.out.childNodes.length - this.maxLines;
      if (extra > 0) {
        for (let i = 0; i < extra; i++) this.out.removeChild(this.out.firstChild);
      }
    }

    _saveHistory() {
      try {
        localStorage.setItem(this.persistKey, JSON.stringify(this.history.slice(-200)));
      } catch {}
    }

    _loadHistory() {
      try {
        const raw = localStorage.getItem(this.persistKey);
        if (!raw) return [];
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
      } catch {
        return [];
      }
    }

    _pushHistory(cmd) {
      const t = cmd.trim();
      if (!t) return;
      if (this.history[this.history.length - 1] !== t) this.history.push(t);
      this.hIndex = this.history.length;
      this._saveHistory();
    }

    _historyUp() {
      if (!this.history.length) return;
      this.hIndex = clamp(this.hIndex - 1, 0, this.history.length);
      this.input.value = this.history[this.hIndex] ?? "";
      queueMicrotask(() => this.input.setSelectionRange(this.input.value.length, this.input.value.length));
    }

    _historyDown() {
      if (!this.history.length) return;
      this.hIndex = clamp(this.hIndex + 1, 0, this.history.length);
      this.input.value = this.hIndex === this.history.length ? "" : (this.history[this.hIndex] ?? "");
      queueMicrotask(() => this.input.setSelectionRange(this.input.value.length, this.input.value.length));
    }

    _autocomplete() {
      const v = this.input.value;
      const trimmedLeft = v.replace(/^\s+/, "");
      const parts = tokenize(trimmedLeft);
      const current = parts.length ? parts[0] : "";
      const all = this.completions();

      if (this._tabCycle.base !== current) {
        const list = all.filter((c) => c.startsWith(current));
        this._tabCycle = { base: current, list, idx: 0 };
      }

      const { list } = this._tabCycle;
      if (!list.length) return;

      const pick = list[this._tabCycle.idx % list.length];
      this._tabCycle.idx++;

      const rest = parts.slice(1).join(" ");
      this.input.value = rest ? `${pick} ${rest}` : pick;
      queueMicrotask(() => this.input.setSelectionRange(this.input.value.length, this.input.value.length));
    }

    async run(cmd) {
      const trimmed = (cmd ?? "").trim();
      if (!trimmed) return;
      this.echoCommand(trimmed);
      this._pushHistory(trimmed);
      try {
        await this.onCommand(trimmed);
      } catch (err) {
        this.println(`Error: ${err?.message ?? String(err)}`, "term-bad");
      }
    }
  }

  function buildCommands({ state, term }) {
    const st = state && typeof state === "object" ? state : {};
    st.projects = Array.isArray(st.projects) ? st.projects : [];
    st.contacts = Array.isArray(st.contacts) ? st.contacts : [];
    st.tracks = Array.isArray(st.tracks) ? st.tracks : [];

    const commands = new Map();
    const register = (name, meta) => commands.set(name, { name, ...meta });
    const listCommands = () => [...commands.keys()].sort();

    const themeKey = "portfolio.terminal.theme";
    const weatherKey = "portfolio.terminal.weather.location";
    const themes = ["default", "matrix", "amber", "ice", "mono"];

    function getTheme() {
      try {
        return localStorage.getItem(themeKey) || "default";
      } catch {
        return "default";
      }
    }

    function setTheme(name) {
      const t = themes.includes(name) ? name : "default";
      themes.forEach((x) => term.root.classList.remove(`term-theme-${x}`));
      term.root.classList.add(`term-theme-${t}`);
      try {
        localStorage.setItem(themeKey, t);
      } catch {}
      return t;
    }

    function getDefaultLocation() {
      try {
        return localStorage.getItem(weatherKey) || "Asia";
      } catch {
        return "Asia";
      }
    }

    function setDefaultLocation(loc) {
      try {
        localStorage.setItem(weatherKey, loc);
      } catch {}
    }

    async function fetchWeatherByName(name) {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        name
      )}&count=1&language=en&format=json`;
      const geoRes = await fetch(geoUrl, { cache: "no-store" });
      if (!geoRes.ok) throw new Error("Geocoding failed");
      const geo = await geoRes.json();
      const r = geo?.results?.[0];
      if (!r?.latitude || !r?.longitude) throw new Error("Location not found");
      const lat = r.latitude;
      const lon = r.longitude;
      const place = [r.name, r.admin1, r.country].filter(Boolean).join(", ");

      const wxUrl = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(
        lat
      )}&longitude=${encodeURIComponent(
        lon
      )}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
      const wxRes = await fetch(wxUrl, { cache: "no-store" });
      if (!wxRes.ok) throw new Error("Weather fetch failed");
      const wx = await wxRes.json();
      const cur = wx?.current;
      if (!cur) throw new Error("Weather data unavailable");
      return {
        place,
        time: cur.time,
        temp: cur.temperature_2m,
        humid: cur.relative_humidity_2m,
        wind: cur.wind_speed_10m,
        code: cur.weather_code,
        unitTemp: wx?.current_units?.temperature_2m || "°C",
        unitHumid: wx?.current_units?.relative_humidity_2m || "%",
        unitWind: wx?.current_units?.wind_speed_10m || "km/h",
      };
    }

    register("help", {
      desc: "Show available commands",
      usage: "help [command]",
      run: async (args) => {
        const q = args[0];
        if (q) {
          const c = commands.get(q);
          if (!c) return term.println(`No help for: ${q}`, "term-bad");
          term.println(`${q} — ${c.desc ?? ""}`, "term-muted");
          if (c.usage) term.println(`Usage: ${c.usage}`, "term-muted");
          return;
        }
        term.println("Commands:", "term-muted");
        for (const name of listCommands()) {
          const c = commands.get(name);
          term.println(`- ${name}${c?.desc ? `: ${c.desc}` : ""}`, "term-muted");
        }
        term.println("Tips: ↑/↓ history, Tab autocomplete, Ctrl+L clear", "term-muted");
      },
    });

    register("clear", { desc: "Clear terminal output", usage: "clear", run: async () => term.clear() });

    register("about", {
      desc: "Show about info",
      usage: "about",
      run: async () => {
        term.println("i'm ZiolKen. a random guy that love gaming, avn, coding & car.", "term-muted");
        term.println("Try: weather  |  theme", "term-muted");
      },
    });

    register("projects", {
      desc: "List featured projects",
      usage: "projects",
      run: async () => {
        if (!st.projects.length) return term.println("No projects found.", "term-muted");
        term.println("Featured Projects:", "term-muted");
        st.projects.forEach((p, i) => {
          const name = p?.name ?? `Project ${i + 1}`;
          const badge = p?.badge ?? "";
          const link = p?.link ?? "";
          if (link) {
            const a = makeSafeLink(link, `${i + 1}. ${name}${badge ? ` (${badge})` : ""} - ${link}`);
            if (a) return term.printNode(a, "term-muted");
          }
          term.println(`${i + 1}. ${name}${badge ? ` (${badge})` : ""}${link ? ` - ${link}` : ""}`, "term-muted");
        });
      },
    });

    register("contact", {
      desc: "Show contact info",
      usage: "contact",
      run: async () => {
        if (!st.contacts.length) return term.println("No contacts found.", "term-muted");
        term.println("Contact:", "term-muted");
        st.contacts.forEach((c) => {
          const label = c?.label ?? "Contact";
          const value = c?.value ?? "";
          const maybeMail = typeof value === "string" && value.includes("@") ? `mailto:${value}` : null;
          if (maybeMail) {
            const a = makeSafeLink(maybeMail, `${label}: ${value}`);
            if (a) return term.printNode(a, "term-muted");
          }
          term.println(`${label}: ${value}`, "term-muted");
        });
      },
    });

    register("echo", { desc: "Print text", usage: "echo <text>", run: async (args) => term.println(args.join(" ")) });

    register("open", {
      desc: "Open a link in a new tab",
      usage: "open <url>",
      run: async (args) => {
        const url = args[0];
        if (!url) return term.println("Usage: open <url>", "term-bad");
        const a = makeSafeLink(url, url);
        if (!a) return term.println("Blocked: only http/https/mailto allowed.", "term-bad");
        window.open(a.href, "_blank", "noopener,noreferrer");
        term.println(`Opened: ${a.href}`, "term-good");
      },
    });

    register("play", {
      desc: "Play track by index",
      usage: "play <n>",
      run: async (args) => {
        const audio = $("#audio");
        if (!audio) return term.println("Audio element not found (#audio).", "term-bad");
        const idx = Number(args[0]) - 1;
        if (!Number.isFinite(idx) || idx < 0 || idx >= st.tracks.length) return term.println("Invalid track number.", "term-bad");
        if (typeof window.setActiveTrack === "function") window.setActiveTrack(idx);
        try {
          await audio.play();
          term.println(`Playing #${idx + 1}: ${st.tracks[idx]?.title ?? "Unknown"}`, "term-good");
        } catch {
          term.println("Cannot autoplay. Click play in the player.", "term-bad");
        }
      },
    });

    register("pause", {
      desc: "Pause audio",
      usage: "pause",
      run: async () => {
        const audio = $("#audio");
        if (!audio) return term.println("Audio element not found (#audio).", "term-bad");
        audio.pause();
        term.println("Paused.", "term-good");
      },
    });

    register("now", {
      desc: "Show current time",
      usage: "now",
      run: async () => term.println(new Date().toString(), "term-muted"),
    });

    register("theme", {
      desc: "Set or list terminal themes",
      usage: "theme [name] | theme list | theme current",
      run: async (args) => {
        const a0 = (args[0] ?? "").toLowerCase();
        if (!a0 || a0 === "list") {
          term.println(`Themes: ${themes.join(", ")}`, "term-muted");
          term.println(`Current: ${getTheme()}`, "term-muted");
          term.println(`Use: theme matrix`, "term-muted");
          return;
        }
        if (a0 === "current") {
          term.println(`Current: ${getTheme()}`, "term-muted");
          return;
        }
        if (!themes.includes(a0)) {
          term.println(`Unknown theme: ${a0}`, "term-bad");
          term.println(`Available: ${themes.join(", ")}`, "term-muted");
          return;
        }
        const t = setTheme(a0);
        term.println(`Theme set: ${t}`, "term-good");
      },
    });

    register("weather", {
      desc: "Show current weather",
      usage: 'weather [location] | weather set "location" | weather default',
      run: async (args) => {
        const sub = (args[0] ?? "").toLowerCase();
        if (sub === "default") {
          term.println(`Default location: ${getDefaultLocation()}`, "term-muted");
          return;
        }
        if (sub === "set") {
          const loc = args.slice(1).join(" ").trim();
          if (!loc) return term.println('Usage: weather set "London"', "term-bad");
          setDefaultLocation(loc);
          term.println(`Default location set: ${loc}`, "term-good");
          return;
        }

        const loc = args.join(" ").trim() || getDefaultLocation();
        term.println(`Fetching weather for: ${loc} ...`, "term-muted");

        try {
          const w = await fetchWeatherByName(loc);
          const line1 = `${w.place} @ ${w.time}`;
          const line2 = `${wmoDesc(w.code)} • ${w.temp}${w.unitTemp} • Humidity ${w.humid}${w.unitHumid} • Wind ${w.wind}${w.unitWind}`;
          term.println(line1, "term-muted");
          term.println(line2, "term-good");
        } catch (e) {
          term.println("Weather unavailable (network or location).", "term-bad");
          term.println('Try: weather "Asia"  |  weather set "New York"', "term-muted");
        }
      },
    });

    setTheme(getTheme());

    return { commands, listCommands };
  }

  function initTerminal() {
    const out = $("#terminal-out");
    const input = $("#terminal-in");
    const clearBtn = $("#term-clear");
    if (!out || !input) return;

    const promptEl = $("#terminal-prompt");
    const root = $("#terminal") ?? out.closest("[data-terminal]") ?? out.parentElement ?? document.body;
    const state = window.state ?? {};

    const term = new WebTerminal({
      out,
      input,
      clearBtn,
      promptEl,
      root,
      maxLines: 500,
      persistKey: "portfolio.terminal.history",
      completions: () => (window.__termCommands ? window.__termCommands() : []),
    });

    const { commands, listCommands } = buildCommands({ state, term });
    window.__termCommands = () => listCommands();

    term.println("Type 'help' to see commands.", "term-muted");

    term.onCommand = async (raw) => {
      const tokens = tokenize(raw);
      const head = tokens[0]?.toLowerCase();
      const args = tokens.slice(1);
      const cmd = commands.get(head);
      if (!cmd) return term.println("Command not found. Type 'help'.", "term-bad");
      await cmd.run(args);
    };
  }

  function init() {
    initTerminal();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();