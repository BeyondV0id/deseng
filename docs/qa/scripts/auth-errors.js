async (page) => {
  const out = {};
  const net = [];
  page.on('response', r => { if (r.url().includes('/api/')) net.push(r.status() + ' ' + r.request().method() + ' ' + r.url().replace('http://127.0.0.1:5180', '').slice(0, 70)); });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });
  const email = 'qa.agent.1793795541048@example.com';

  await page.goto('http://127.0.0.1:5180/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  await page.getByRole('button', { name: /Account menu/ }).click();
  await page.getByRole('menu').waitFor({ state: 'visible', timeout: 8000 });
  await page.waitForTimeout(400);
  await page.getByRole('menuitem', { name: 'Sign out' }).click();
  await page.waitForTimeout(2500);
  out.signedOut = {
    url: page.url().replace('http://127.0.0.1:5180', ''),
    topBar: await page.evaluate(() => [...document.querySelectorAll('header button')].map(b => (b.getAttribute('aria-label') || b.innerText).replace(/\n/g, ' ').slice(0, 30))),
    session: await page.evaluate(async () => (await (await fetch('/api/auth/get-session')).json())),
  };

  await page.getByRole('button', { name: 'Sign in' }).first().click();
  const dlg = page.locator('[role=dialog]');
  await dlg.waitFor({ state: 'visible', timeout: 8000 });
  await dlg.locator('input[name=email]').fill(email);
  await dlg.locator('input[name=password]').fill('WrongPassword123!');
  await dlg.getByRole('button', { name: /^Sign in$/ }).click();
  await page.waitForTimeout(2500);
  out.wrongPassword = {
    dialogs: await page.locator('[role=dialog]').count(),
    text: (await page.locator('[role=dialog]').innerText()).slice(0, 300),
    alert: await page.evaluate(() => {
      const el = document.querySelector('[role=alert], [class*=error]');
      return el ? { role: el.getAttribute('role'), text: el.innerText.slice(0, 120), live: el.getAttribute('aria-live') } : null;
    }),
  };

  await page.getByRole('button', { name: 'Create an account' }).click();
  await page.waitForTimeout(500);
  await dlg.locator('input[name=name]').fill('QA Agent');
  await dlg.locator('input[name=email]').fill(email);
  await dlg.locator('input[name=password]').fill('QaPassw0rd2026!');
  await dlg.getByRole('button', { name: /^Create account$/ }).click();
  await page.waitForTimeout(2500);
  out.duplicateEmail = {
    dialogs: await page.locator('[role=dialog]').count(),
    text: (await page.locator('[role=dialog]').innerText()).slice(0, 300),
  };
  out.net = net;
  out.errs = errs;
  return out;
}
