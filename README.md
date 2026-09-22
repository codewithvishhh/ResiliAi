# ResiliAI — AI for Safer, Stronger Communities

Hyperlocal disaster risk prediction, early warning, and community resilience
dashboard. Built with Next.js, TypeScript, Tailwind CSS, Framer Motion,
Recharts, and Lucide icons.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Project structure

```
app/
  layout.tsx        Root layout, fonts, metadata
  page.tsx           Entry point — renders <ResiliAI />
  globals.css        Tailwind + reduced-motion support
components/
  ResiliAI.tsx        Full dashboard (landing, map, alerts, command center, AI assistant)
lib/
  api.ts              Service layer — swap mock data for a FastAPI backend
```

## Connecting the FastAPI backend

Copy `.env.local.example` to `.env.local` and set:

```
NEXT_PUBLIC_API_BASE_URL=https://your-fastapi-host.com
```

`lib/api.ts` already targets the endpoints from the spec:
`/api/risk`, `/api/weather`, `/api/areas`, `/api/alerts`, `/api/reports`
(GET + POST), `/api/emergency-locations`, `/api/chat`. Wire the dashboard
components to these calls in place of the mock arrays at the top of
`components/ResiliAI.tsx` when the backend is ready — no redesign needed.

## Enabling live news

The dashboard includes a server-side `/api/news` proxy backed by GNews. Create
an account at https://gnews.io, copy `.env.local.example` to `.env.local`, and
set:

```
GNEWS_API_KEY=your-gnews-api-key
```

The key stays on the server and is never exposed to the browser. Without it,
the dashboard keeps showing the built-in demo incident feed.

## Deploy

See the deployment guide provided alongside this project.
