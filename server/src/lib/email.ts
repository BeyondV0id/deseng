/**
 * Resend, called over its HTTP API so the server needs no extra SDK.
 *
 * With no RESEND_API_KEY the message is printed instead, which is what makes
 * password reset usable on a fresh checkout: copy the link out of the terminal
 * and open it. Only the delivery step changes between the two paths.
 */

type Mail = {
  to: string
  subject: string
  html: string
  text: string
}

const resendEndpoint = 'https://api.resend.com/emails'

export async function sendMail({ to, subject, html, text }: Mail) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM ?? 'desgnix <no-reply@desgnix.app>'

  if (!apiKey) {
    console.info(`\n[email] ${subject} -> ${to}\n${text}\n`)
    return
  }

  const response = await fetch(resendEndpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: [to], subject, html, text }),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`Resend rejected the message (${response.status}): ${detail}`)
  }
}

function escapeHtml(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
}

/**
 * The reset message. The link is Better Auth's own URL, so the token and the
 * redirect back to /reset-password stay in its hands.
 */
export async function sendPasswordResetEmail({ to, name, url }: { to: string; name: string; url: string }) {
  const greeting = name ? `Hi ${name},` : 'Hi,'
  const subject = 'Reset your desgnix password'
  const text = [
    greeting,
    '',
    'Someone asked to reset the password for your desgnix account. Open the link below to choose a new one. It works once and expires in an hour.',
    '',
    url,
    '',
    'If this was not you, ignore this message. Your password will not change.',
  ].join('\n')

  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:32px 16px;background:#fafafa;font-family:Inter,-apple-system,Segoe UI,sans-serif;color:#151515;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;">
      <tr>
        <td style="padding:28px 28px 8px;font-size:15px;line-height:1.6;">
          <p style="margin:0 0 16px;">${escapeHtml(greeting)}</p>
          <p style="margin:0 0 20px;">Someone asked to reset the password for your desgnix account. Choose a new one with the button below. The link works once and expires in an hour.</p>
          <p style="margin:0 0 24px;">
            <a href="${escapeHtml(url)}" style="display:inline-block;padding:10px 18px;border-radius:999px;background:#151515;color:#ffffff;text-decoration:none;font-weight:500;">Choose a new password</a>
          </p>
          <p style="margin:0 0 8px;color:#6b6b6b;font-size:13px;">If the button does not work, paste this address into your browser:</p>
          <p style="margin:0 0 20px;font-size:13px;word-break:break-all;"><a href="${escapeHtml(url)}" style="color:#151515;">${escapeHtml(url)}</a></p>
          <p style="margin:0;padding-top:16px;border-top:1px solid #e5e7eb;color:#6b6b6b;font-size:13px;">If this was not you, ignore this message. Your password will not change.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`

  await sendMail({ to, subject, html, text })
}
