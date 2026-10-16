# hillview-team-web

The HillviewTV team dashboard — videos, uploads, captions, playlists, assets, links and users.

> **Hillview platform** · Next.js app · team.hillview.tv (Lattice stack 38)

---

## Overview

The staff and student dashboard at **team.hillview.tv**: video management and Cloudflare Stream uploads, caption/transcript editing, playlists, the homepage spotlight, equipment checkouts, short links and user administration. Google sign-in or local login through hillviewAuthAPI; students see a reduced dashboard.

## Role in the Hillview ecosystem

One of three Hillview web apps (hillview.tv, team.hillview.tv, watch.hillview.tv) in front of the five Hillview Go APIs at `api.hillview.tv`. Reports to Monitor zone **hillview** as `hillview-team-web`.

## Tech stack

Next.js 15.5 (**Pages Router**), React 19, Redux Toolkit, Tailwind CSS v3, TypeScript, axios with a refresh-token interceptor, `@react-oauth/google`, Headless UI (legacy — do not copy), `@aidenappleby/monitor-js` · Docker · Lattice

## Getting started

### Prerequisites

Node 24, the `dev` CLI.

### Setup

```bash
npm install
cp .env.example .env.local   # where present; see AGENTS.md §4 for the variables
dev
```

## Development

| Command         | What it does                    |
| --------------- | ------------------------------- |
| `dev`           | Start the dev server            |
| `dev build`     | Production build                |
| `dev lint`      | ESLint                          |
| `dev format`    | Prettier                        |
| `dev typecheck` | `tsc --noEmit`                  |
| `dev check`     | lint + format check + typecheck |

## Project structure

See [AGENTS.md §3](AGENTS.md#3-project-structure).

## Deployment

Push to `main` → GitHub Actions builds `registry.appleby.cloud/hillview-team-web:latest` → Lattice stack 38 redeploys the container (worker-5, port 3011).

## Contributing & further reading

- [AGENTS.md](AGENTS.md) — conventions, telemetry, operations
- Related: hillview-tv-web, hillview-team-web, hillview-live-web, hillviewVideoAPI, hillviewCoreAPI, hillviewAuthAPI
