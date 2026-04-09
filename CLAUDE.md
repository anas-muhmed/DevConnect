# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DevConnect is a full-stack MERN developer community platform with posts, comments, voting, following, notifications, and search. It uses JWT access + refresh token auth, Redux for frontend state, and Docker for containerization.

## Commands

### Backend (run from `backend/`)
```bash
npm run dev        # Start with nodemon (auto-reload)
npm start          # Start production server
npm test           # Run Jest tests (--runInBand --detectOpenHandles)
npm run test:watch # Jest in watch mode
```

### Frontend (run from `frontend/`)
```bash
npm run dev    # Start Vite dev server on port 5180
npm run build  # Production build
npm run lint   # ESLint
npm run preview # Preview production build
```

### Docker (run from repo root)
```bash
docker-compose up --build   # Build and start all services
docker-compose down         # Stop all services
```

### Run a single test
```bash
cd backend && npx jest tests/health.test.js
```

## Architecture

### Ports
- Frontend dev: `5180`
- Backend: `5000` (direct), `5001` (Docker-mapped)
- MongoDB: `27017`

### Request Flow
- **Dev**: Browser → Vite (5180) → direct Axios calls to `http://127.0.0.1:5000/api`
- **Docker**: Browser → Nginx (8080) → proxies `/api` and `/uploads` to `backend:5000`

### Auth System
Access token (short-lived JWT) stored in `localStorage`/`sessionStorage` + refresh token in `httpOnly` cookie. The Axios instance in `frontend/src/api/axios.js` auto-refreshes on 401 via a queue to prevent concurrent refresh races. Backend `authMiddleware.js` validates Bearer tokens on all protected routes.

### Backend Structure
- **Entry**: `server.js` connects MongoDB then starts Express app from `app.js`
- **Routes** → **Controllers** pattern; routes live in `backend/routes/`, logic in `backend/controllers/`
- **Middleware**: `authMiddleware` (JWT), `uploadMiddleware` (Multer), `imageOptimization` (Sharp), `inputValidation` (express-validator rules for registration), `validation.js` (generic field validators), global error handler (`middleware/errorHandler.js`)
- **Error convention**: throw errors with a `statusCode` property (e.g. `const err = new Error('msg'); err.statusCode = 404; throw err`) — the global handler reads `err.statusCode` and `err.message`
- File uploads served statically at `/uploads`
- Health check at `GET /health`

### Frontend Structure
- **Routing**: `App.jsx` — public: `/login`, `/register`; protected (under `PrivateRoute` + `Layout`): `/` (Home), `/profile` (own), `/profile/:username` (others), `/posts/:id`, `/create`, `/search`, `/notifications`, `/communities`, `/explore`, `/saved`, `/discussions`; stub pages render `ComingSoonPage`
- **State**: Redux Toolkit store at `frontend/src/redux/` — `authSlice` (user session) and `profileSlice` (profile data)
- **API layer**: `frontend/src/api/axios.js` (interceptors + refresh queue), `post.js`, `profile.js`; higher-level helpers in `frontend/src/services/userService.js`

### Key Models
- **User**: username, email, password (hashed), profilePicture, bio, followers/following arrays
- **Post**: user ref, title, content, image, comments (embedded), upvotes/downvotes arrays
- **Notification**: activity feed events

## Environment Setup

Backend requires `backend/.env` (copy from `backend/.env.example`):
```
MONGO_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
NODE_ENV=development
PORT=5000
HOST=0.0.0.0
# Optional AWS S3 for image uploads:
AWS_REGION=
AWS_S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

Frontend uses `frontend/.env` with `VITE_API_BASE_URL` (defaults to `http://127.0.0.1:5000/api` in dev).

## API Routes Summary

| Prefix | Module |
|--------|--------|
| `/api/auth` | register, login, refresh token, logout |
| `/api/posts` | CRUD posts, comments, voting |
| `/api/profile` | view/update profile |
| `/api/user` | follow/unfollow, update username |
| `/api/search` | search users/posts |
| `/api/notifications` | activity notifications |
| `/health` | health check (status, uptime, db state) |

## Testing

Tests live in `backend/tests/`. Currently only `health.test.js` exists (uses Supertest). Jest config is in `backend/package.json` under the `"jest"` key; `testMatch` is `**/tests/**/*.test.js`.
