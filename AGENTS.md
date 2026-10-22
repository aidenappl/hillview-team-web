# AGENTS.md — hillview-team-web

## 1. What this repo is

The staff and student dashboard at **team.hillview.tv**: video management and Mux uploads, caption/transcript editing, playlists, the homepage spotlight, equipment checkouts, short links and user administration. Google sign-in or local login through hillviewAuthAPI; students see a reduced dashboard.

Served at **team.hillview.tv** from Lattice stack 38 "Hillview Web". It moved off Vercel (team `hillview-ms`) in October 2026. It owns no data — everything comes from the Hillview Go APIs at `api.hillview.tv`.

## 2. Stack & dependencies

- Next.js 16 (**Pages Router**), React 19, Redux Toolkit, Tailwind CSS v4 (`@tailwindcss/postcss`, CSS-first config in `styles/globals.css` — no `tailwind.config.js`), TypeScript, axios with a refresh-token interceptor, `@react-oauth/google`, Headless UI (legacy — do not copy), `@mux/upchunk` (uploads), `@mux/mux-player-react` (caption editor), `@aidenappleby/monitor-js`
- Node 24 (Docker `node:24-alpine`), `output: "standalone"`
- Telemetry: `@aidenappleby/monitor-js` ^1.2.1 → Monitor zone **hillview** (§6)

## 3. Project structure

```
hillview-team-web/
  pages/                       # routes; `pages/api/` holds `health` and `monitor` (telemetry relay)
  components/                  # UI
  hooks/                       # data hooks
  lib/                         # `monitor-server.ts`, `monitor-relay.ts`
  models/, types/, validators/ # shapes and form validation
  redux/                       # store + `user` slice
  services/                    # `http/requestHandler.ts` (axios + refresh queue), session/token/cookie handlers, `monitor.service.ts`
  utils/                       # Mux url helpers (`mux.ts`), VTT, duration helpers
  styles/                      # Tailwind v4 entry (`@import "tailwindcss"`) + v3-compat base styles
  instrumentation.ts           # onRequestError → Monitor (Node runtime only)
  instrumentation-client.ts    # creates the browser Monitor before hydration
  next.config.*                # standalone output, image hosts, security headers
  Dockerfile                   # node:24-alpine build → standalone runner as uid 1001, HEALTHCHECK /api/health
  .github/workflows/push-to-registry.yml   # main → registry.appleby.cloud → Lattice redeploy
  Devfile.yaml                 # dev CLI commands
```

## 4. Running, building & testing

```bash
dev            # next dev
dev build      # next build
dev check      # lint + prettier --check + tsc --noEmit
```

| Variable                       | Kind      | Purpose                                                                                                                    |
| ------------------------------ | --------- | -------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`          | build arg | https://api.hillview.tv                                                                                                    |
| `NEXT_PUBLIC_BASE_URL`         | build arg | https://team.hillview.tv                                                                                                   |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | build arg | the Hillview Google OAuth client (public)                                                                                  |
| `MONITOR_INGEST_URL`           | runtime   | Monitor ingest, `https://hillview-monitor-api.appleby.cloud/v1/events`. Unset = telemetry discarded (logged once a minute) |
| `MONITOR_API_KEY`              | runtime   | Ingest-scoped key minted on the **hillview** zone; server-side only                                                        |
| `MONITOR_ENV`                  | runtime   | Event `env` (default `production`)                                                                                         |

`NEXT_PUBLIC_*` values are compiled into the bundle: they are Docker **build args** set in `push-to-registry.yml`, not Lattice env. Changing one needs a rebuild, not a redeploy. Locally, put them in `.env.local`.

## 5. How code is written here

- Data fetching is imperative (`useEffect` + service calls, or `getServerSideProps`) through the axios wrapper in `services/http/requestHandler.ts`; no SWR/React Query.
- Report errors with `reportError(name, error, data)` from `services/monitor.service.ts` in boundaries and catch blocks that change what the user sees. Never put form values, tokens or response bodies in event data.
- The Monitor ingest key never reaches the browser: the browser SDK posts to the same-origin `/api/monitor`, which validates the batch, forces `service` to `hillview-team-web`, adds the key and forwards.
- Lint is the ESLint 9 flat config in `eslint.config.mjs` (`npm run lint` → `eslint .`; Next 16 removed `next lint`). The React Compiler rules from eslint-plugin-react-hooks v7 are switched off there on purpose — they flag 38 existing patterns; enable them when refactoring those components.
- Legacy codebase: some components predate the estate standards (e.g. component libraries, Pages Router). Don't extend those patterns.
- **Tailwind v4 CSS layering:** utilities live in `@layer utilities`, and unlayered CSS beats any layer. Put element-level rules (`html`, `body`, `a`, `*`, resets) inside `@layer base` in `styles/globals.css`, or they will override utility classes. Theme tokens go in `@theme`, not a JS config.

## 6. Domain & architecture

**Request flow:** Cloudflare (proxied, `hillview.tv` zone) → NPM proxy host → worker-5 `10.15.10.79:3011` → Next.js standalone server. Browser API calls go straight to `https://api.hillview.tv`.

**Auth:** hillviewAuthAPI issues JWTs; the access token is kept in cookies via `cookies-next` and sent as a Bearer header. A 401 triggers one refresh (queued for concurrent requests) and a retry. Google sign-in's authorised origins include `https://team.hillview.tv`.

**Uploads (Mux, Oct 2026):** `UploadComponent` asks hillviewVideoAPI `POST /video/v1.1/upload/mux/upload` for a Mux direct-upload url (videoAPI holds the Mux credentials; this app holds none), `@mux/upchunk, `@mux/mux-player-react` (caption editor)` PUTs the file straight to Mux in 50MB chunks, then the component polls `GET /video/v1.1/upload/mux/{id}` (`waiting` → `preparing` → `ready`). The status fills the form's `url` (`https://stream.mux.com/{playback_id}.m3u8`), `download_url` (`…/{playback_id}/highest.mp4`) and duration; the video row is then created through hillviewCoreAPI as before. Mux gives no encoding percentage, so the dropzone shows "Encoding…" alone. For existing videos, the download-url action derives the Mux MP4 url locally; the frame picker builds `image.mux.com` thumbnails; the caption editor previews and seeks with `@mux/mux-player-react`. There is no Cloudflare Stream code or config left (the Stream account was emptied 2026-10-21).

### Monitor telemetry

Service **`hillview-team-web`**, zone **`hillview`** (Lattice stack 37). Server-side events ship directly from the container; browser events go through `/api/monitor`. The server client is created lazily from runtime env and installs no process-wide handlers, so a crash still crashes the container.

| Event                                     | Level        | Meaning                                                                                                                                             |
| ----------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `server.request.error`                    | error        | a server render / API route threw (`instrumentation.ts` `onRequestError`): message, stack, digest, route, router kind                               |
| `client.error.boundary`                   | error        | a render error reached an error boundary                                                                                                            |
| `(uncaught errors, unhandled rejections)` | error        | captured by the browser SDK automatically                                                                                                           |
| `api.request.*`                           | warn / error | a failed axios call to the Hillview APIs, with the API's `X-Request-ID` so it joins the API's own `http.request.end`                                |
| `monitor.relay.rejected`                  | warn         | the relay refused a batch (`reason`: cross_origin, body_too_large, too_many_events, invalid_json, not_an_object) — at most once a minute per reason |

## 7. Ecosystem & related repos

- **Calls:** hillviewVideoAPI, hillviewCoreAPI, hillviewAuthAPI, hillviewLinksAPI, hillviewAssetsAPI (all at `api.hillview.tv`).
- **Siblings:** hillview-tv-web (hillview.tv), hillview-team-web (team.hillview.tv), hillview-live-web (watch.hillview.tv) — same Dockerfile, CI and Monitor wiring.
- **Monitor:** zone `hillview`; agents query it with `mcp__monitor_hillview__*`.

## 8. Operations

- **Lattice stack 38 "Hillview Web"** on worker-5 (id 8, `10.15.10.79`), container `hillview-team-web`, host port `3011`. Stack env: `MONITOR_HILLVIEW_INGEST_URL` / `MONITOR_HILLVIEW_INGEST_KEY`.
- **CI:** push to `main` → `push-to-registry.yml`: registry credentials from Keyring (token `hillview-web-ci`, via `aidenappl/keyring-actions`), build on the shared `lattice-builder`, push `registry.appleby.cloud/hillview-team-web:latest`, then `LATTICE_DEPLOY_URL?container=hillview-team-web`. GitHub secrets: `KEYRING_URL`, `KEYRING_ACCESS_KEY_ID`, `KEYRING_SECRET_ACCESS_KEY`, `LATTICE_DEPLOY_URL`.
- Env or compose changes need a **stack Deploy** in Lattice; a CI container redeploy reuses the old config.
- **Edge:** Cloudflare DNS record (proxied) → NPM proxy host with the Cloudflare real-IP block and a Let's Encrypt certificate (DNS challenge).
- **Health:** `GET /api/health` (Docker HEALTHCHECK). **Errors:** Monitor zone hillview, `service: hillview-team-web`. **Logs:** `lattice_get_container_logs`.
- The old Vercel project (`hillview-ms/hillview-team-web`) is no longer serving traffic; don't redeploy it.

## 9. Rules & guardrails

- Never expose `MONITOR_API_KEY` to the browser or prefix it `NEXT_PUBLIC_`.
- Never proxy large files through this server — the studio has one WAN.
- Keep `lib/monitor-relay.ts` / `lib/monitor-server.ts` in step with the sibling Hillview web repos.

## 10. Verification

```bash
npx tsc --noEmit
npm run lint
npx prettier --check <the files you changed>
npx next build
```

There is no PR CI here: run the checks below yourself.

## 11. Keeping this file updated

Any change to structure, stack, commands, conventions, routes, env vars, events or deployment updates this file (and `README.md` where setup or role changed) in the same change.
