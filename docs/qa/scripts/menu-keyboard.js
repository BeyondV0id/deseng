async (page) => {
  const out = {};
  const errs = [];
  page.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });
  await page.goto('http://127.0.0.1:5180/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: /Account menu/ }).click();
  await page.waitForTimeout(600);
  out.menuHtml = await page.evaluate(() => {
    const m = document.querySelector('[role=menu]');
    if (!m) return null;
    return [...m.querySelectorAll('button, [role=menuitem], [role=switch], [role=radio]')].map(e => ({
      role: e.getAttribute('role'),
      tag: e.tagName,
      label: e.getAttribute('aria-label'),
      text: e.innerText.replace(/\n/g, ' ').slice(0, 40),
      checked: e.getAttribute('aria-checked'),
      pressed: e.getAttribute('aria-pressed'),
      disabled: e.disabled,
    }));
  });
  // tab through the menu, capture focus order
  const order = [];
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(120);
    order.push(await page.evaluate(() => {
      const a = document.activeElement;
      const cs = a ? getComputedStyle(a) : null;
      return {
        el: a ? (a.getAttribute('aria-label') || a.innerText || a.tagName).replace(/\n/g, ' ').slice(0, 40) : null,
        outline: cs ? cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor : null,
        inMenu: a ? !!a.closest('[role=menu]') : null,
      };
    }));
  }
  out.tabOrder = order;
  out.errs = errs;
  return out;
}
