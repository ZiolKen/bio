(() => {
  const $ = (s, r = document) => r.querySelector(s);

  const musicRoot =
    document.querySelector('.row-span-2.md\\:col-span-1.lg\\:col-span-1.lg\\:row-span-2') ||
    document.querySelector('.row-span-2.md\\:col-span-1') ||
    document.querySelector('.row-span-2');

  const projectsGrid = $('#projects-grid');

  if (musicRoot && !musicRoot.id) musicRoot.id = 'music-card';
  if (projectsGrid && !projectsGrid.id) projectsGrid.id = 'projects-grid';

  const MusicPlayer = (() => {
    if (!musicRoot) return null;

    const titleEl = $('h3', musicRoot);
    const artistEl = $('p', musicRoot);
    const progressWrap = musicRoot.querySelector('.w-full.h-0\\.5') || musicRoot.querySelector('.w-full');
    const progressBar = progressWrap ? progressWrap.querySelector('div') : null;

    const btns = Array.from(musicRoot.querySelectorAll('button'));
    const btnPlay = btns[1] || null;

    const imgEl = $('img', musicRoot);

    const track = { title: 'Bloody Moon', artist: 'Unknown', src: 'https://raw.githubusercontent.com/ZiolKen/bio/main/assets/bloody_moon.mp3', cover: './res/music.png' };

    const audio = new Audio(track.src);
    audio.preload = 'auto';

    let raf = 0;

    const setProgress = (pct) => {
      if (!progressBar) return;
      const p = Math.max(0, Math.min(100, pct));
      progressBar.style.width = `${p}%`;
    };

    const setPlayIcon = (playing) => {
      if (!btnPlay) return;
      const svg = btnPlay.querySelector('svg');
      if (!svg) return;
      svg.setAttribute('viewBox', '0 0 448 512');
      svg.innerHTML = playing
        ? '<path d="M144 479H48c-26.5 0-48-21.5-48-48V80c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v351c0 26.5-21.5 48-48 48zm304-48V80c0-26.5-21.5-48-48-48h-96c-26.5 0-48 21.5-48 48v351c0 26.5 21.5 48 48 48h96c26.5 0 48-21.5 48-48z"></path>'
        : '<path d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"></path>';
    };

    const tick = () => {
      cancelAnimationFrame(raf);
      const d = audio.duration || 0;
      const c = audio.currentTime || 0;
      setProgress(d ? (c / d) * 100 : 0);
      if (!audio.paused) raf = requestAnimationFrame(tick);
    };

    const render = () => {
      if (titleEl) titleEl.textContent = track.title;
      if (artistEl) artistEl.textContent = track.artist;
      if (imgEl && track.cover) imgEl.src = track.cover;
      setProgress(0);
      setPlayIcon(false);
    };

    const play = async () => {
      try {
        await audio.play();
      } catch (_) {
        setPlayIcon(false);
      }
    };

    const pause = () => audio.pause();

    const toggle = () => {
      if (audio.paused) play();
      else pause();
    };

    const seekFromEvent = (e) => {
      if (!progressWrap) return;
      const rect = progressWrap.getBoundingClientRect();
      const clientX = e.touches?.[0]?.clientX ?? e.clientX;
      const x = clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, x / rect.width));
      if (audio.duration) audio.currentTime = ratio * audio.duration;
      tick();
    };

    if (btnPlay) btnPlay.addEventListener('click', toggle);

    if (progressWrap) {
      progressWrap.style.cursor = 'pointer';
      progressWrap.addEventListener('click', seekFromEvent, { passive: true });
      progressWrap.addEventListener('touchstart', seekFromEvent, { passive: true });
    }

    audio.addEventListener('play', () => {
      setPlayIcon(true);
      tick();
    });

    audio.addEventListener('pause', () => {
      setPlayIcon(false);
      cancelAnimationFrame(raf);
    });

    audio.addEventListener('ended', () => {
      audio.currentTime = 0;
      setPlayIcon(false);
      setProgress(0);
    });

    render();
    return { play, pause };
  })();

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