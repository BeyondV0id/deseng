# Auth review: OAuth, sessions, password reset, client flows

Audit date: 2026-11-04. Scope: Better Auth wiring (`server/src/auth.ts`),
session middleware (`server/src/middleware/session.ts`), email (`server/src/lib/email.ts`),
API routes (`server/src/routes/*`), schema (`server/src/db/auth-schema.ts`),
client client (`client/src/lib/auth-client.ts`), client auth components/pages,
auth routes (`client/src/App.tsx`), auth docs. Out of scope: SEO/meta files,
brand assets, catalogue data, unrelated components.

## What was checked

### Provider wiring
- Google/GitHub enabled only when both halves of the credential pair are set
  (`server/src/auth.ts:36-55`). Verified the env-driven shape compiles and the
  `/api/config` surface reflects it (`server/src/index.ts:30-32`,
  `client/src/components/auth/auth-shell.tsx:161-181`).
- Callback / redirect URIs. Better Auth derives provider callback URLs from
  `baseURL` + basePath (`/api/auth/callback/<provider>`, confirmed in
  `@better-auth/core` redirect-URI handling) and the client passes an explicit
  `callbackURL` (`client/src/components/auth/auth-form.tsx:92-101`). The
  installed Better Auth (1.7.14) validates redirect URIs against a safe-URL
  schema server-side (HTTPS required except loopback, no fragments), so the
  client-built `${origin}${back}` value cannot smuggle an open redirect.
- `BETTER_AUTH_URL` / `CLIENT_ORIGIN` trusted origins, dev and would-be
  production. `server/src/auth.ts:14-19` builds `trustedOrigins` from
  `CLIENT_ORIGIN`, `BETTER_AUTH_URL` and the two localhost dev origins; the
  production deploy must set both env keys to the site origin.
- `basePath` (`/api/auth`, default) and the Vite proxy
  (`client/vite.config.ts:proxy['/api'] -> target with changeOrigin + xfwd: true`,
  dev + preview). Verified `xfwd` writes a single-value `x-forwarded-for`, which
  is the only shape Better Auth trusts when no `TRUSTED_PROXIES` CIDR list is
  set (`@better-auth/core` `utils/ip.ts`: multi-value chains are ignored without
  a trusted-proxy list, single value accepted).
- Cookie flags. Session cookie attributes resolved from
  `advanced.useSecureCookies ?? baseURL https ?? production` with
  `sameSite: 'lax'`, `httpOnly`, `path: '/'` (`better-auth` cookies factory).
  The app sets `useSecureCookies: isProduction`, so dev is non-secure and
  production secure; no custom `domain` is set (host-only cookie). No
  `crossSubDomainCookies`, no `disableCSRFCheck`/`disableOriginCheck`.

### Session handling
- `loadSession` → `requireSession` middleware chain; catalogue read public,
  catalogue create, and everything under `/api/library/*` guarded
  (`server/src/middleware/session.ts:10-34`, `server/src/routes/catalog.ts:17,43`,
  `server/src/routes/library.ts:11`).
- Public surface audit: `GET /api/catalog` public, `POST /api/catalog` guarded,
  `GET /api/config`, `GET /api/health` public, `/api/auth/*` public by design
  (`server/src/index.ts:21-35`). No unguarded data route found.
- 401 shape: `{ error: 'Sign in required.' }` with status 401
  (`server/src/middleware/session.ts:21-27`); Better Auth's own 401s surface
  through the same `{ error }` envelope the client reads (`client/src/lib/api.ts:32-36`).
- Session expiry/refresh: 30-day session, 1-day refresh age; DB-backed sessions
  (no `secondaryStorage`, `cookieCache` not enabled) so expiry is enforced
  server-side.
- Sign-out everywhere in the client: single call site
  `client/src/pages/page.tsx:510-517` (`signOut()` then navigate), fed to the
  account menu through `client/src/components/application/dashboard/app-navbar.tsx:53`.

### Client flows
- `useSession` read shaped by `AuthProvider`/`useAuth`; guards wait on
  `isPending` before deciding (`client/src/components/auth/auth-provider.tsx:64-83`).
- `/sign-in` vs `/sign-up` share `auth-page.tsx` + `AuthForm` with an in-place
  mode switch; reset/forgot use their own shells but the same error component.
- Overlay (`auth-overlay.tsx`) over the catalogue; intent replay
  (`client/src/lib/auth-intent.ts`, `client/src/pages/page.tsx:313-336`).
- `redirectTo`/`from` handling: `RequireAuth` writes `location.state.from`;
  `GuestOnly` reads it and navigates; `AuthForm` passes `returnTo` for social
  callback. `from` originates only from `pathname + search` (internal) today.
- Error surfaces: `client/src/lib/auth-messages.ts` maps 429/401, falls back to
  the server message; no stack traces; forgot-password answers the same way for
  unknown addresses (Better Auth simulates the lookup — no enumeration).
- Disabled/loading states: submit + social buttons carry `loading`/`disabled`.
- Password reset end to end: request (`redirectTo: origin + /reset-password`),
  Better Auth token URL (`/api/auth/reset-password/:token?callbackURL=...`),
  reset POST (`resetPassword({ newPassword, token })`), 1-hour token,
  `?error=INVALID_TOKEN` handling. No `RESEND_API_KEY` → `server/src/lib/email.ts:22-25`
  prints the link.

### Hardening
- Rate limit: `enabled`, window 60s, max 100 (`server/src/auth.ts:88-92`). Window
  units confirmed as seconds in better-auth 1.7 (`BetterAuthRateLimitRule`).
- Account linking: left at library defaults (implicit linking on; verified
  `account.accountLinking.enabled` defaults to true) — policy decision pending.
- Email verification: intentionally off (no verification mail, no gate).
- Password minimums: 8 server/client, max 128.
- Callback URL validation: delegated to library safe-URL schema.

## Findings by severity

| ID | Severity | Where | Finding |
| --- | --- | --- | --- |
| B1 | blocker | `server/.env:14-16,21-23` | Google/GitHub client id + secret are empty, so both social providers are disabled (`server/src/auth.ts:36-53`). Sign-in with a provider cannot work until real credentials are supplied. Needs a human decision. |
| H1 | high | `server/src/auth.ts:77` | `emailAndPassword.revokeSessionsOnPasswordReset` was not set (library default `false`). A password reset changed the credential but left existing sessions alive. **Fixed**: set `revokeSessionsOnPasswordReset: true`. |
| M1 | medium | `client/src/App.tsx:19-22`, `client/src/components/auth/auth-provider.tsx:64-83` | `RequireAuth` is implemented and pending-aware but never mounted on a route; the app gates in-page via `needsAccount` (`client/src/pages/page.tsx:37-43,313-318`). Guard behaviour is correct but currently unreachable wiring. |
| M2 | medium | `client/src/components/auth/auth-provider.tsx:79-82` | `GuestOnly` navigates to the `from` value without re-validating it. Today `from` is only ever written from internal `pathname+search`, so risk is low, but it is an open-redirect surface if the write path ever changes. |
| M3 | medium | `server/src/auth.ts:88-92` | Rate limit chosen (60s / 100) is valid for better-auth 1.7 units; no change made. |
| L1 | low | `server/src/index.ts:52-55` | Express error handler maps everything to a generic 500; Better Auth handles its own error envelope. No stack leaks observed. |

## What was changed and why

- `server/src/auth.ts`: added `emailAndPassword.revokeSessionsOnPasswordReset: true`
  (after the existing `sendResetPassword` handler). Why: a reset is a credential
  change; per the Better Auth model it should revoke the user's sessions so a
  stolen reset link cannot leave a live session behind. Library default was `false`.

No other behaviour was altered. Env files, OAuth credentials, account-linking
policy and email-verification stance were deliberately left alone.

## Deliberately left alone

- Social provider credentials and provider enablement policy (blocked on B1).
- Account linking policy (`account.accountLinking`, implicit linking) — default
  behaviour, product decision.
- Email verification posture (kept off by design; see comments in
  `server/src/auth.ts:70-82`).
- Rate-limit tuning (tightening the 60 req/min window is a product decision).
- Session cookie `sameSite`/`secure` overrides (defaults already correct).
- `server/src/lib/email.ts` console fallback and `EMAIL_FROM`.

## Manual test script

Run with dev servers up (`npm run dev:client`, `npm run dev:server`) and
`server/.env` filled.

1. **Sign-up**: `/sign-up` → create account → lands back on the catalogue
   (auto sign-in, verification off).
2. **Sign-out**: account menu → Sign out → returns to catalogue, session gone.
3. **Protected URL while signed out**: signed out, open a favourites/moodboard
   address → auth overlay opens with intent; API `GET /api/moodboards` → 401
   `{ error: 'Sign in required.' }`.
4. **Reset link from console**: forgot password → request → with no
   `RESEND_API_KEY`, copy the printed link, open it, choose new password.
5. **Wrong password**: sign-in with a bad password → "That email and password do
   not match."
6. **Duplicate email**: sign-up with an existing email → error surfaced, no stack.

## Verification

- `npm run typecheck` — passes after the change.
