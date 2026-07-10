# PWA Easy Rental

Monorepo Next.js — **une seule app de déploiement** `easy-rental-web` (Webpack, standalone).

## Architecture

```
apps/
  easy-rental-web/     # App unique prod (:3000) — /, /client, /agency, /organisation, /admin
  container-shell/     # Legacy dev (deprecated)
  mfe-*/               # Legacy dev (deprecated)
packages/
  shared-ui/
  shared-services/
```

## Développement

```bash
npm install
npm run dev          # easy-rental-web sur :3000
```

Backend local requis sur `:8081` (rewrites `/api-rental`).

## Build production

```bash
npm run build        # Webpack — @pwa-easy-rental/easy-rental-web uniquement
```

## Docker

```bash
docker build -f apps/easy-rental-web/Dockerfile -t easyrental-web .
docker run -p 3000:3000 -e API_URL=http://host.docker.internal:8081 easyrental-web
```

Stack complète : `docker compose -f docker-compose.prod.yml up` (ajuster secrets).

## Vercel

Root directory : `apps/easy-rental-web` — voir `vercel.json`.

## Legacy (multi-apps)

`npm run dev:legacy` lance les 5 apps séparées (ports 3000–3004) pour debug isolé.
