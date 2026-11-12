async (page) => {
  const out = {};
  const net = [];
  page.on('response', r => { if (r.url().includes('/api/')) net.push(r.status() + ' ' + r.request().method() + ' ' + r.url().replace('http://127.0.0.1:5180', '').slice(0, 70)); });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });

  // sign in with the new password
  await page.goto('http://127.0.0.1:5180/sign-in', { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  await page.locator('input[name=email]').fill('qa.agent.1793795541048@example.com');
  await page.locator('input[name=password]').fill('QaPassw0rd2026!New');
  await page.getByRole('button', { name: /^Sign in$/ }).click();
  await page.waitForTimeout(3000);
  out.afterSignIn = {
    url: page.url().replace('http://127.0.0.1:5180', ''),
    h1: await page.locator('h1').allInnerTexts(),
    account: await page.evaluate(() => !!document.querySelector('[aria-label^="Account menu"]')),
  };

  // GuestOnly: visit /sign-in while signed in
  await page.goto('http://127.0.0.1:5180/sign-in', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  out.guestOnlySignIn = { url: page.url().replace('http://127.0.0.1:5180', ''), h1: await page.locator('h1').allInnerTexts() };
  await page.goto('http://127.0.0.1:5180/sign-up', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  out.guestOnlySignUp = { url: page.url().replace('http://127.0.0.1:5180', ''), h1: await page.locator('h1').allInnerTexts() };

  // submit dialog validation
  await page.goto('http://127.0.0.1:5180/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: 'Submit a resource' }).first().click();
  const dlg = page.locator('[role=dialog]');
  await dlg.waitFor({ state: 'visible', timeout: 8000 });
  await page.waitForTimeout(500);
  out.submitDialog = {
    h1: await dlg.locator('h1,h2').allInnerTexts(),
    fields: await dlg.locator('input,textarea,[role=combobox]').evaluateAll(els => els.map(e => e.getAttribute('name') || e.getAttribute('role'))),
    focus: await page.evaluate(() => document.activeElement?.getAttribute('name')),
  };
  await dlg.locator('input[name=name]').fill('QA entry');
  await dlg.locator('input[name=url]').fill('not a url');
  await dlg.getByRole('button', { name: /Add resource/ }).click();
  await page.waitForTimeout(900);
  out.invalidUrl = {
    dialogOpen: await page.locator('[role=dialog]').count(),
    error: await page.evaluate(() => { const e = document.querySelector('.form-error'); return e ? { text: e.innerText, role: e.getAttribute('role') } : null; }),
  };
  await dlg.locator('input[name=url]').fill('https://www.figma.com');
  await dlg.getByRole('button', { name: /Add resource/ }).click();
  await page.waitForTimeout(2500);
  out.duplicateUrl = {
    dialogOpen: await page.locator('[role=dialog]').count(),
    error: await page.evaluate(() => { const e = document.querySelector('.form-error'); return e ? { text: e.innerText, role: e.getAttribute('role') } : null; }),
    body: (await page.locator('[role=dialog]').innerText()).slice(0, 250),
  };
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  out.afterEscape = {
    dialogOpen: await page.locator('[role=dialog]').count(),
    focus: await page.evaluate(() => (document.activeElement?.getAttribute('aria-label') || document.activeElement?.innerText || document.activeElement?.tagName || '').slice(0, 40)),
  };
  out.net = net;
  out.errs = errs;
  return out;
}
