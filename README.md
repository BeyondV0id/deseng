# desgnix

A catalogue of design references: interfaces, interactions and the tools that
build them. React 19 + TypeScript in the browser, Express + Better Auth + Drizzle
on the server, Postgres (Supabase) behind it.

## Run locally

```sh
npm install

cp server/.env.example server/.env   # fill DATABASE_URL, DIRECT_URL and BETTER_AUTH_SECRET

npm run db:migrate                   # create the tables
npm run db:seed                      # load the catalogue

npm run dev                          # API on :3001, Vite on :5180
```

`npm run dev` starts both workspaces. Vite proxies `/api` to the API server, so
the app, the API and the session cookie share one origin. The first account is
created at `/sign-up`; Google and GitHub appear there once their client ids and
secrets are in `server/.env`.

## Workspaces

| Folder | What lives there |
| --- | --- |
| `client/` | The SPA: `src/`, `index.html`, `vite.config.ts`, the tsconfigs, `components.json` |
| `server/` | The API: Better Auth, Drizzle schema and migrations, catalogue seed, REST routes |

Commands run from the root:

| Command | Does |
| --- | --- |
| `npm run dev` | API and client together |
| `npm run dev:client` / `npm run dev:server` | One side only |
| `npm run build` | Client build, then the server's TypeScript |
| `npm start` | Serve the built client and the API from one process |
| `npm run typecheck` | Both workspaces |
| `npm run auth:generate` | Rewrite the Better Auth tables after a plugin change |
| `npm run db:generate` / `db:migrate` | Write and apply a migration |
| `npm run db:seed` | Load `server/src/db/catalog.json` into Postgres |

## What's here

- A searchable catalogue organised by the sections of [stealth.pm](https://www.stealth.pm/): Observe, Read, Create, Build, Components, Assets, Tools and Desk.
- Accounts with email and password, Google and GitHub, a password reset by email, and a 30-day session.
- Favourites, filed resources and moodboards kept against the account, so they follow it between devices.
- Add your own link and choose a category; it joins the shared catalogue.
- Fluid Hover on the compact sidebar navigation, using the [Fluid Functionalism component](https://www.fluidfunctionalism.com/docs/fluid-hover).
- Reicon React icons, imported by glyph to keep the icon set consistent.
- Built on the [Arc](https://uiarc.dev) component library, vendored under `client/src/components/arc`.
- Locally bundled Inter, used for both display and body text.
- Responsive sidebar and native, keyboard-accessible dialogs.
- Folder-card animation adapted from [Rare UI](https://www.rareui.com/components/foldercomponent).

The seed directory was collected from stealth.pm on 25 October 2026. Account
data lives in Postgres; the browser keeps only the theme, the sound switch and
the Open Graph cache.

Conventions for working in this repo live in [AGENTS.md](./AGENTS.md).
