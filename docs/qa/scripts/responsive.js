async (page) => {
  const out = {};
  const errs = [];
  page.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });

  for (const w of [390, 768, 1024, 1440]) {
    await page.setViewportSize({ width: w, height: 844 });
    await page.goto('http://127.0.0.1:5180/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    const rec = await page.evaluate(() => {
      const de = document.documentElement;
      const vis = el => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && r.bottom > 0 && r.top < innerHeight;
      };
      const interactive = [...document.querySelectorAll('button, a[href], input, select, textarea, [role=button], [role=menuitem]')].filter(vis);
      const small = interactive.map(el => {
        const r = el.getBoundingClientRect();
        return {
          t: (el.getAttribute('aria-label') || el.innerText || el.tagName).replace(/\n/g, ' ').slice(0, 34),
          w: Math.round(r.width), h: Math.round(r.height),
        };
      }).filter(x => x.w < 44 || x.h < 44);
      const sidebar = document.querySelector('aside, [data-sidebar], [class*=app-sidebar]');
      const searchBar = document.querySelector('.app-search-bar');
      const searchTrigger = document.querySelector('.app-search-trigger');
      const menuTrigger = [...document.querySelectorAll('button')].find(b => /menu/i.test(b.getAttribute('aria-label') || ''));
      return {
        scrollW: de.scrollWidth, clientW: de.clientWidth, overflow: de.scrollWidth - de.clientWidth,
        smallCount: small.length, small: small.slice(0, 12),
        sidebarVisible: sidebar ? vis(sidebar) : false,
        searchBarW: searchBar ? Math.round(searchBar.getBoundingClientRect().width) : null,
        searchTriggerBox: searchTrigger ? searchTrigger.getBoundingClientRect().toJSON() : null,
        menuTrigger: menuTrigger ? (menuTrigger.getAttribute('aria-label') || menuTrigger.innerText).slice(0, 40) : null,
        topBarButtons: [...document.querySelectorAll('header button')].map(b => (b.getAttribute('aria-label') || b.innerText).replace(/\n/g, ' ').slice(0, 30)),
      };
    });
    out['w' + w] = rec;
  }
  out.errs = errs;
  return out;
}
