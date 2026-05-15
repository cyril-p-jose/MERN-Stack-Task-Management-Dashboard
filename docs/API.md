# TaskFlow REST API

Base URL: `http://localhost:5000/api` (configurable via `PORT`).

All task and activity routes require `Authorization: Bearer <JWT>`.

## Authentication

| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | `{ name, email, password }` | Create user, returns `{ _id, name, email, token }` |
| POST | `/auth/login` | `{ email, password }` | Login, returns `{ _id, name, email, token }` |
| GET | `/auth/me` | — | Current user profile |
| PUT | `/auth/profile` | `{ name?, avatarUrl?, timezone?, password? }` | Update profile (password min 6 if provided) |

## Tasks

| Method | Path | Query / body | Description |
|--------|------|--------------|-------------|
| GET | `/tasks/stats` | — | Aggregated counts and productivity metrics |
| GET | `/tasks` | `search`, `status`, `priority`, `sort` | List tasks for the authenticated user |
| GET | `/tasks/:id` | — | Single task |
| POST | `/tasks` | `{ title, description?, status?, priority?, deadline? }` | Create task |
| PUT | `/tasks/:id` | Partial fields | Update task |
| DELETE | `/tasks/:id` | — | Delete task |

### Query parameters (`GET /tasks`)

- `search` — case-insensitive match on title or description  
- `status` — `pending` \| `in_progress` \| `completed`  
- `priority` — `low` \| `medium` \| `high`  
- `sort` — `newest` (default) \| `oldest` \| `deadline_asc` \| `deadline_desc`

## Activities

| Method | Path | Query | Description |
|--------|------|-------|-------------|
| GET | `/activities` | `limit` (default 30, max 100) | Recent activity feed for the user |

## Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | `{ status, timestamp }` |

## Error format

Failed requests return JSON:

```json
{ "message": "Human readable message", "errors": [] }
```

`errors` is present for validation failures (express-validator).
