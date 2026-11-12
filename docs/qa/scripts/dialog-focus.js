async (page) => {
  const out = {};
  await page.goto('http://127.0.0.1:5180/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const trigger = page.getByRole('button', { name: 'Submit a resource' }).first();
  await trigger.click();
  const dlg = page.locator('[role=dialog]');
  await dlg.waitFor({ state: 'visible', timeout: 8000 });
  await page.waitForTimeout(400);
  const order = [];
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    order.push(await page.evaluate(() => {
      const a = document.activeElement;
      return {
        el: a ? (a.getAttribute('aria-label') || a.getAttribute('name') || a.innerText || a.tagName).replace(/\n/g, ' ').slice(0, 40) : null,
        inDialog: a ? !!a.closest('[role=dialog]') : null,
      };
    }));
  }
  out.tabOrder = order;
  out.escapedDialog = order.some(o => o.inDialog === false);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(700);
  out.afterEscape = await page.evaluate(() => ({
    dialogs: document.querySelectorAll('[role=dialog]').length,
    active: document.activeElement ? document.activeElement.tagName + '|' + (document.activeElement.getAttribute('aria-label') || document.activeElement.innerText || '').replace(/\n/g, ' ').slice(0, 40) : null,
    isTrigger: document.activeElement?.getAttribute('aria-label') === 'Submit a resource',
  }));
  return out;
}
