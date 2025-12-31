# VisionBoard (local dev)

This repository contains a small Express + MongoDB backend under `backend/` and a static frontend in `docs/`.

Quick start (local development)

1. Start the backend (from repo root):

```bash
cd backend
npm install
cp .env.example .env   # edit values if needed
npm start
```

2. Open the frontend

- Option A (recommended during dev): the backend serves `docs/` on the same origin. Open http://localhost:3000/index.html
- Option B: serve `docs/` with a static server from repo root:

```bash
npx serve docs
# then open the served URL (usually http://localhost:5000)
```

Notes & cleanup suggestions

- The project currently has duplicate/possibly-unused packages declared in the root `package.json` (e.g. `bcrypt` vs `bcryptjs`, `cheerio`, `node-fetch`, `playwright`). Consider running `npx depcheck` and removing unused packages.
- Two package.json files exist (root and `backend/`). The backend uses CommonJS (`require`) — keep running the backend from the `backend/` folder or remove `type: module` from root package.json (already removed).

If anything breaks, paste the browser Network response body and backend terminal logs and I'll help debug further.
