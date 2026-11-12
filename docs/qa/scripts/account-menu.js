async (page) => {
  const out = {};
  await page.goto('http://127.0.0.1:5180/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: /Account menu/ }).click();
  await page.waitForTimeout(800);
  out.menu = await page.evaluate(() => {
    const m = document.querySelector('[role=menu]') || document.querySelector('[data-radix-popper-content-wrapper]') || document.querySelector('[role=dialog]');
    return m ? m.innerText.slice(0, 500) : null;
  });
  out.items = await page.evaluate(() => [...document.querySelectorAll('[role=menuitem],[role=menuitemcheckbox],[role=switch]')].map(e => ({
    r: e.getAttribute('role'),
    t: (e.getAttribute('aria-label') || e.innerText).replace(/\n/g, ' ').slice(0, 60),
    state: e.getAttribute('aria-checked') || e.getAttribute('aria-pressed'),
  })));
  out.focus = await page.evaluate(() => document.activeElement ? (document.activeElement.getAttribute('role') || document.activeElement.tagName) : null);
  return out;
}
