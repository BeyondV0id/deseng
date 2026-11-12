async (page) => {
  const out = {};
  const net = [];
  page.on('response', r => { if (r.url().includes('/api/') || r.url().includes('reset-password')) net.push(r.status() + ' ' + r.request().method() + ' ' + r.url().slice(0, 110)); });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });

  const link = 'http://localhost:3001/api/auth/reset-password/vgS71YhIs4ckKT7UQOouUoDw?callbackURL=http%3A%2F%2F127.0.0.1%3A5180%2Freset-password';
  await page.goto(link, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  out.afterLink = {
    url: page.url(),
    h1: await page.locator('h1').allInnerTexts(),
    inputs: await page.locator('input').evaluateAll(els => els.map(e => ({ name: e.name, type: e.type }))),
    text: (await page.evaluate(() => (document.querySelector('main') || document.body).innerText)).slice(0, 300),
  };
  const pw = page.locator('input[name=password]');
  if (await pw.count()) {
    await pw.fill('QaPassw0rd2026!New');
    const confirm = page.locator('input[name=confirmPassword]');
    if (await confirm.count()) await confirm.fill('QaPassw0rd2026!New');
    await page.getByRole('button', { name: /Set|Save|Update|Reset/i }).first().click();
    await page.waitForTimeout(2500);
    out.afterReset = {
      url: page.url().replace('http://127.0.0.1:5180', ''),
      text: (await page.evaluate(() => (document.querySelector('main') || document.body).innerText)).slice(0, 350),
      dialogs: await page.locator('[role=dialog]').count(),
    };
  }
  out.net = net;
  out.errs = errs;
  return out;
}
