(() => {
  const $ = (s, r = document) => r.querySelector(s);

  const projectsGrid = $('#projects-grid');

  const FeaturedProjects = (() => {
    if (!projectsGrid) return null;

    const owner = 'ZiolKen';
    const apiUrl = `https://api.github.com/users/${owner}/repos?per_page=100&sort=updated`;
    const cacheKey = `gh_deployed_${owner}_v1`;
    const cacheTtlMs = 10 * 60 * 1000;

    let destroyMarquee = null;
    let clickBound = false;

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

    const enableMarquee = (container, { speed = 32 } = {}) => {
      if (!container) return () => {};

      container.classList.add('projects-marquee');

      const reduce =
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reduce) {
        container.style.overflowX = 'auto';
        container.style.webkitOverflowScrolling = 'touch';
        return () => {};
      }

      const cards = [...container.querySelectorAll('.project-card')];
      if (cards.length <= 1) return () => {};

      const html = cards.map((c) => c.outerHTML).join('');
      const track = document.createElement('div');
      track.className = 'projects-track';
      track.innerHTML = html + html;

      container.innerHTML = '';
      container.appendChild(track);

      let raf = 0;
      let paused = false;
      let x = 0;
      let last = performance.now();
      let half = 1;

      const measure = () => {
        const total = track.scrollWidth;
        half = Math.max(1, total / 2);
        x = x % half;
        track.style.transform = `translate3d(${-x}px,0,0)`;
      };

      const tick = (now) => {
        const dt = (now - last) / 1000;
        last = now;

        if (!paused) {
          x += speed * dt;
          if (x >= half) x -= half;
          track.style.transform = `translate3d(${-x}px,0,0)`;
        }
        raf = requestAnimationFrame(tick);
      };

      const onEnter = () => { paused = true; };
      const onLeave = () => { paused = false; last = performance.now(); };

      container.addEventListener('mouseenter', onEnter);
      container.addEventListener('mouseleave', onLeave);
      container.addEventListener('focusin', onEnter);
      container.addEventListener('focusout', onLeave);

      const onVis = () => {
        if (document.hidden) paused = true;
        else { paused = false; last = performance.now(); }
      };
      document.addEventListener('visibilitychange', onVis);

      const ro = new ResizeObserver(measure);
      ro.observe(track);

      measure();
      raf = requestAnimationFrame(tick);

      return () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        container.removeEventListener('mouseenter', onEnter);
        container.removeEventListener('mouseleave', onLeave);
        container.removeEventListener('focusin', onEnter);
        container.removeEventListener('focusout', onLeave);
        document.removeEventListener('visibilitychange', onVis);
      };
    };

    const cardHtml = (r) => {
      const name = escapeHtml(r.name);
      const desc = escapeHtml(r.description || 'No description');
      const lang = escapeHtml(r.language || '');
      const url = escapeHtml(r.html_url || '#');
      const stars = formatNum(r.stargazers_count);
      const live = escapeHtml(liveUrlOf(r));

      return `
        <a class="project-card" href="${url}" target="_blank" rel="noreferrer">
          <div class="project-card-head">
            <div class="project-left">
              <div class="project-icon" aria-hidden="true"></div>
              <div class="project-name">${name}</div>
            </div>

            <div class="project-metrics">
              <span class="metric" title="Stars">★ ${stars}</span>
              <span class="metric github" title="GitHub" aria-label="GitHub">
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
                  0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52
                  -.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2
                  -3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82
                  .64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12
                  .51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48
                  0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                </svg>
              </span>
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
        <div class="project-card skeleton" style="width:420px; height:220px;"></div>
        <div class="project-card skeleton" style="width:420px; height:220px;"></div>
        <div class="project-card skeleton" style="width:420px; height:220px;"></div>
      `;
    };

    const setError = () => {
      projectsGrid.innerHTML = `
        <div class="project-card error" style="width:420px;">
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

        if (!clickBound) {
          clickBound = true;
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
        }

        destroyMarquee?.();
        destroyMarquee = enableMarquee(projectsGrid, { speed: 30 });
      } catch (_) {
        setError();
      }
    };

    render();
    return { render };
  })();

  window.__ziolken = { FeaturedProjects };
})();