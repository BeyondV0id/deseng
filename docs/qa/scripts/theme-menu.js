async (page) => {
  const out = {};
  const errs = [];
  page.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });
  await page.goto('http://127.0.0.1:5180/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  out.themeBefore = await page.evaluate(() => ({
    stored: localStorage.getItem('reference-theme-v2'),
    cls: document.documentElement.classList.contains('dark'),
    dataset: document.documentElement.dataset.theme,
    bodyBg: getComputedStyle(document.body).backgroundColor,
    pageBg: getComputedStyle(document.documentElement).getPropertyValue('--page-background').trim(),
    themeColor: document.querySelector('meta[name=theme-color]')?.getAttribute('content'),
    prefersDark: matchMedia('(prefers-color-scheme: dark)').matches,
  }));

  await page.getByRole('button', { name: /Account menu/ }).click();
  await page.waitForTimeout(500);
  // arrow navigation inside the menu
  const arrows = [];
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(150);
    arrows.push(await page.evaluate(() => {
      const a = document.activeElement;
      return a ? (a.getAttribute('aria-label') || a.innerText || a.tagName).replace(/\n/g, ' ').slice(0, 40) : null;
    }));
  }
  out.arrowOrder = arrows;
  // Escape closes?
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  out.escape = {
    menuOpen: await page.locator('[role=menu]').count(),
    focus: await page.evaluate(() => document.activeElement ? (document.activeElement.getAttribute('aria-label') || document.activeElement.tagName) : null),
  };

  // switch theme to dark via menu
  await page.getByRole('button', { name: /Account menu/ }).click();
  await page.waitForTimeout(500);
  await page.getByRole('menuitemradio', { name: 'Dark' }).click();
  await page.waitForTimeout(900);
  out.afterDark = await page.evaluate(() => ({
    stored: localStorage.getItem('reference-theme-v2'),
    cls: document.documentElement.classList.contains('dark'),
    dataset: document.documentElement.dataset.theme,
    pageBg: getComputedStyle(document.documentElement).getPropertyValue('--page-background').trim(),
    menuStillOpen: !!document.querySelector('[role=menu]'),
  }));
  await page.getByRole('menuitemradio', { name: 'Light' }).click();
  await page.waitForTimeout(900);
  out.afterLight = await page.evaluate(() => ({
    stored: localStorage.getItem('reference-theme-v2'),
    cls: document.documentElement.classList.contains('dark'),
    pageBg: getComputedStyle(document.documentElement).getPropertyValue('--page-background').trim(),
    menuStillOpen: !!document.querySelector('[role=menu]'),
  }));
  out.errs = errs;
  return out;
}
