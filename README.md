
# ComicStop

Full-stack web application for managing and sharing comics (Vite + React frontend, Express + Sequelize backend).

## Monorepo layout

```
backend/           # Express API (Sequelize ORM)
comments-service/  # Comments microservice (Express)
frontend/          # Vite + React web client
```

## Prerequisites

- Node.js 20+ and npm 10+
- Git

## Quick start (local dev)

1) Backend (SQLite for local)

```
cd backend
cp .env.local .env 2>/dev/null || true
npm install
npm run seed   # creates dev sqlite DB and dummy users
npm run dev    # starts API on http://localhost:3001
```

2) Frontend

```
cd frontend
npm install
npm run dev    # opens http://localhost:5173
```

3) Verify integration

- Frontend uses API base URL http://localhost:3001/api in development (see `frontend/src/config.js`).
- Visit http://localhost:5173 and ensure pages load and network calls to http://localhost:3001/api succeed.

## Detailed setup

### Backend (Express + Sequelize)

Local development is configured to use SQLite. To set up:

```
bash scripts/setup-backend-local.sh
```

What it does:
- Installs backend deps
- Creates `backend/.env.local` with `DB_DIALECT=sqlite`
- Seeds the local SQLite DB with a few dummy users

Run the API:

```
cd backend
npm run dev
```

API will be available at http://localhost:3001. Swagger docs at http://localhost:3001/api-docs.

### Frontend (Vite + React)

```
cd frontend
npm install
npm run dev
```

Build for production:

```
cd frontend
npm run build
npm run preview
```

### Integration notes

- Frontend dev server runs on 5173 and talks to backend on 3001. CORS is configured to allow http://localhost:5173.
- Auth tokens are stored in localStorage by `frontend/src/services/api.js`.
- Update `frontend/src/config.js` if your ports differ.

## Testing

There is no automated test suite configured for the frontend yet. Manual validation:

1. Backend up on 3001 with SQLite.
2. Frontend up on 5173.
3. Navigate to `/signup` → create user → then `/login` → login → verify profile API.

## Scripts

- `scripts/setup-backend-local.sh` — one-shot local backend setup with SQLite.

## Notes

- For production, set DB_DIALECT=postgres and provide DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD.
- AWS S3 values are required for upload features; for local dev you can keep them unset to focus on auth/navigation flows.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
