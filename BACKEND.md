# Backend — Plug-and-Play (Postgres · API · AI)

The UI is a client SPA that currently reads seeded mock data through
`src/data/repository.js`. A full server layer is wired and testable so you can
adopt a real backend without rewriting screens.

## Layers
```
src/services/            # FRONTEND seam (call the API)
  apiClient.js           #   fetch wrapper around /api
  stigService.js         #   domain data methods (requirements, projects, ...)
  aiService.js           #   AI methods (similar verbiage, CCI suggestions)

app/api/[[...path]]/route.js   # HTTP router -> store + ai (only maps routes)

src/server/              # BACKEND seams
  store.js               #   selects memory | postgres by DATABASE_URL
  memoryStore.js         #   default; seeded, mutable, no infra needed
  pgStore.js             #   Postgres impl (same interface)
  db.js                  #   pg Pool (lazy; only if DATABASE_URL)
  seed.js                #   canonical seed from the mock modules
  ai.js                  #   AI provider abstraction (mock default)
```

## API endpoints
- `GET /api/health` — status, active backend + ai provider
- `GET /api/requirements`, `POST /api/requirements`
- `GET|PUT /api/requirements/:stigId`
- `GET|POST /api/requirements/:stigId/comments`
- `GET /api/requirements/:stigId/srg-detail | /testing`
- `GET /api/projects`, `GET|PUT /api/projects/:id`
- `GET /api/srg-tree | /ccis | /cci-audit | /duplicate-clusters | /audit-log | /enums`
- `POST /api/ai/similar-verbiage`  body `{ field, text, excludeStigId }`
- `GET|POST /api/ai/cci-suggestions`

## Plug in Postgres
1. Add `DATABASE_URL=postgres://user:pass@host:5432/db` to `/app/.env`.
2. Restart. `store.js` switches to `pgStore`, which creates the schema and
   seeds it from `seed.js` on first request. No code changes.

## Plug in real AI
1. Set `AI_PROVIDER` (e.g. `openai`) and the provider key in `/app/.env`.
2. Implement `llmComplete()` in `src/server/ai.js` (obtain the provider
   playbook + key first). Callers (`aiService`, API routes) stay unchanged.

## Move a screen to live data
Replace `import { getRequirements } from '@/data/repository'` with
`import { stigService } from '@/services/stigService'` and load in an effect
(`const [rows,setRows]=useState([]); useEffect(()=>{stigService.getRequirements().then(setRows)},[])`).
