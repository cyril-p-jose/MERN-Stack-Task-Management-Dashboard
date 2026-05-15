# TaskFlow — MERN Task Management Dashboard

A full-stack productivity dashboard built for internship portfolios: JWT auth, MongoDB persistence, Express REST API, and a React (Vite) client with Tailwind CSS, analytics, Kanban drag-and-drop, calendar view, and dark mode.

## Features

- **Auth**: Register, login, JWT, protected routes, logout  
- **Dashboard**: KPI cards, area trend chart, status pie chart, productivity metrics, activity timeline  
- **Tasks**: CRUD, priorities, deadlines, mark complete, filters, search, sorting  
- **Kanban**: Drag-and-drop between Pending → In Progress → Completed (`@hello-pangea/dnd`)  
- **Calendar**: Month grid with deadlines  
- **Profile**: Name, timezone, optional password change  
- **UX**: Toasts, spinners, empty states, responsive layout, sidebar + top bar, light/dark/system theme  

## Prerequisites

- Node.js 18+  
- MongoDB connection string (local or Atlas)  
- Optional: Git for version control (initialize manually if `git` is not on your PATH)

## Setup

### 1. Environment

Copy server env and adjust values (Windows PowerShell: `Copy-Item server\.env.example server\.env`; macOS/Linux: `cp server/.env.example server/.env`).

Set `MONGODB_URI`, `JWT_SECRET` (long random string), and optionally `CLIENT_URL` for production CORS.

### 2. Install dependencies

From the repository root:

```bash
npm run install:all
```

Or install each package separately:

```bash
cd server && npm install
cd ../client && npm install
```

### 3. Run locally

**Terminal A — API**

```bash
cd server
npm run dev
```

**Terminal B — Client**

```bash
cd client
npm run dev
```

If you installed root dev dependencies, you can use one command from the root:

```bash
npm install
npm run dev
```

- API: `http://localhost:5000`  
- App: `http://localhost:5173` (Vite proxies `/api` to the server in development)

### 4. Client environment (optional)

`client/.env.example` defaults to `VITE_API_URL=/api` so the Vite dev proxy can reach Express. For production builds pointing at a remote API, set `VITE_API_URL` to the full API base (for example `https://api.example.com/api`).

## Production build

```bash
cd client && npm run build
```

Serve the `client/dist` folder with any static host and run the Node server separately, ensuring `CLIENT_URL` matches your deployed SPA origin.

## API documentation

See [`docs/API.md`](docs/API.md) for endpoint-level documentation.

## Project structure

```
server/
  config/        # Database connection
  controllers/   # Route handlers
  middleware/    # JWT auth + error handler
  models/        # Mongoose models
  routes/        # Express routers
  utils/         # JWT helper
client/
  src/
    api/         # Axios instance
    components/  # Layout, modals, shared UI
    context/     # Auth + theme
    pages/       # Routed screens
    utils/       # Formatting helpers
```

## Security notes

- Passwords are hashed with `bcryptjs`.  
- Tasks and activities are always scoped to the authenticated user.  
- Use a strong `JWT_SECRET` and HTTPS in production.

## License

MIT — suitable for coursework and portfolio use.
