async (page) => {
  const out = {};
  const net = [];
  page.on('response', r => { if (r.url().includes('/api/')) net.push(r.status() + ' ' + r.request().method() + ' ' + r.url().replace('http://127.0.0.1:5180', '').slice(0, 70)); });
  await page.goto('http://127.0.0.1:5180/forgot-password', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  out.form = {
    h1: await page.locator('h1').allInnerTexts(),
    inputs: await page.locator('input').evaluateAll(els => els.map(e => e.name)),
    buttons: await page.locator('button').evaluateAll(els => els.map(e => (e.getAttribute('aria-label') || e.innerText).replace(/\n/g, ' ').slice(0, 40))),
  };
  await page.locator('input[name=email]').fill('qa.agent.1793795541048@example.com');
  await page.getByRole('button', { name: /Send|Reset|Continue/i }).first().click();
  await page.waitForTimeout(2500);
  out.afterSubmit = {
    url: page.url().replace('http://127.0.0.1:5180', ''),
    text: (await page.evaluate(() => (document.querySelector('main') || document.body).innerText)).slice(0, 400),
    alert: await page.evaluate(() => {
      const el = document.querySelector('[role=alert], [aria-live]');
      return el ? { role: el.getAttribute('role'), live: el.getAttribute('aria-live'), text: el.innerText.slice(0, 150) } : null;
    }),
  };
  out.net = net;
  return out;
}
