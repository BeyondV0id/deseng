async (page) => {
  const out = {};
  await page.goto('http://127.0.0.1:5180/sign-up', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  out.passwordField = await page.evaluate(() => {
    const input = document.querySelector('input[name=password]');
    if (!input) return null;
    const field = input.closest('[class*=field], div');
    return {
      html: field ? field.outerHTML.slice(0, 900) : input.outerHTML,
      describedBy: input.getAttribute('aria-describedby'),
      hintTexts: [...document.querySelectorAll('[id*=hint], [class*=hint], [class*=description]')].map(e => ({
        text: e.innerText.replace(/\n/g, '|').slice(0, 60),
        cls: e.className.toString().slice(0, 40),
        sr: e.getAttribute('class')?.includes('sr-only') || false,
        display: getComputedStyle(e).display,
      })),
    };
  });
  out.errorRegion = await page.evaluate(() => {
    const err = document.querySelector('[class*=auth-error], [class*=AuthError]');
    return err ? { html: err.outerHTML.slice(0, 300), role: err.getAttribute('role'), live: err.getAttribute('aria-live') } : null;
  });
  return out;
}
