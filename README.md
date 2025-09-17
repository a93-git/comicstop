
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
- You can log in without any additional checkboxes; the login form accepts an identifier (email, username, or phone) plus a password.

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
- Auth endpoints are rate limited (login/signup/forgot-password). On exceeding limits, the API returns HTTP 429 with a clear error message which is surfaced in the Login UI.
 - Login button color: The login submit button uses `--color-login-btn` (#FF9B70). Hover and active states use `--color-login-btn-hover` and `--color-login-btn-active` respectively. These are defined in `frontend/src/index.css` and apply in both light and dark themes. Sign Up link styling is unaffected.
 - Immediate login state: On successful login, the app updates global auth state via `AuthContext.login(user, token)` so Navbar and Settings reflect the logged-in user immediately without a page refresh.

### Frontend UI consistency

- 404/NotFound page uses the same `Navbar` component without extra padding or margins around it. Spacing is applied only to the page `main` content to match other screens. A visual test (`frontend/__tests__/NotFound.navbar-visual.test.jsx`) guards this structure.
- Password fields across Login, Signup, and Reset use a consistent structure with a right-aligned, vertically centered visibility toggle. See `frontend/__tests__/PasswordLayout.visual.test.jsx`.

### Profile picture support

- Users have a default avatar derived from their display name: first letter on a deterministic colored background.
- In Settings → Profile, users can upload a custom profile picture. The UI shows a "Change Picture" button that opens a file picker (accepts images). After upload, the avatar switches to the uploaded image.
- Backend endpoint: `PATCH /api/auth/profile/picture` expects `multipart/form-data` with field `profilePicture` and returns the updated user including `profilePictureS3Url`.
- Tests cover both backend upload flow and frontend UI fallback/upload behavior:
	- Backend: `backend/__tests__/auth.profile-picture.int.test.js`
	- Frontend: `frontend/__tests__/Settings.avatar.test.jsx`

### Password reset methods

- Users can reset their password via:
	- Email link: POST `/api/auth/forgot-password` with `{ email }`, then follow `/reset-password?token=...`.
	- Phone PIN: POST `/api/auth/forgot-password/phone` with `{ phone }`, then go to `/reset-password?via=phone` and submit `{ phone, pin, password }` which calls `/api/auth/reset-password/phone`.
- Frontend Forgot Password shows a choice (Email link or Phone PIN). Reset page supports both modes. See tests:
	- Backend: `backend/__tests__/auth.password-reset-phone.int.test.js`
	- Frontend: `frontend/__tests__/ForgotReset.dual-methods.test.jsx`

### Signup methods

- Users can sign up using either an email address or a phone number.
- Frontend provides a radio selection between Email and Phone with an ISD dropdown when Phone is selected. The Email/Phone input appears immediately below the radio group, followed by Username, then Password and Confirm Password fields.
- Backend accepts either `{ email, username, password, termsAccepted }` or `{ isd_code, phone_number, username, password, termsAccepted }` payloads. The legacy `{ emailOrPhone }` shape remains supported for backward compatibility.

Background uniqueness checks:

- On blur, the Signup form checks if the username and the chosen contact (email or phone) are available.
- While validating, the UI shows “Validating…”, then either “available” or “already in use/taken”. The Create account button is disabled while checks are in progress or when any required value is not unique.
- Endpoints used:
	- GET `/api/users/check-username?username=...` → `{ unique: boolean }`
	- GET `/api/users/check-email?email=...` → `{ unique: boolean }`
	- GET `/api/users/check-phone?isd_code=+1&phone=5551234567` → `{ unique: boolean }`

## Testing

Frontend and backend tests are available and run with Jest.

Frontend (Jest + React Testing Library):

```
cd frontend
npm install
npm test
```

Backend:

```
cd backend
npm install
npm test
```

Notes:
- Theme preference changes in Settings apply instantly across the app by updating `document.documentElement[data-theme]` and are persisted in localStorage under `comicstop-theme`.
- On page load, the saved theme is applied before user interaction. AUTO mode follows the system preference and updates on system theme changes.

## Scripts

- `scripts/setup-backend-local.sh` — one-shot local backend setup with SQLite.

## Notes

- For production, set DB_DIALECT=postgres and provide DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD.
- AWS S3 values are required for upload features; for local dev you can keep them unset to focus on auth/navigation flows.
	- To test profile picture uploads end-to-end, set `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `S3_BUCKET_NAME` in `backend/.env.local`. In test mode, S3 operations are stubbed automatically.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
