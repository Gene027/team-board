# TeamBoard Frontend

Next.js frontend for TeamBoard, a lightweight internal work management platform.

## Current Scope

This app implements the main user-facing workflow for:

- Signup and login
- Persisting authenticated sessions in the browser
- Protected project dashboard
- Project creation and search
- Project workspace view
- Project member management
- Task creation, filtering, assignment, status updates, and comments
- Responsive UI for desktop and mobile use

## Architecture

The frontend is a single Next.js application built with the App Router, React, TypeScript, Tailwind CSS, Axios, React Query, React Hook Form, and Zod.

The application is organized by feature instead of by technical layer only:

- `app/`: route entrypoints and global layout
- `features/auth`: authentication screens, session helpers, and protected layout behavior
- `features/projects`: project dashboard, project cards, project creation flow
- `features/tasks`: project workspace, task board, modals, and task/member workflows
- `services`: API clients for auth, users, projects, and tasks
- `interfaces`: frontend TypeScript interfaces for API payloads and UI data
- `components/ui`: shared reusable UI primitives
- `hooks`: cross-feature hooks for auth, users, and debounced search
- `constants`: API, route, and storage keys

Pages stay thin and delegate behavior to feature components. API calls are centralized in service modules, while React Query handles caching, loading states, refetching, and mutation updates. Axios attaches the JWT access token to protected requests and redirects to login when an authenticated request receives a `401`.

This is intentionally a single deployable frontend. The current structure keeps development fast while still giving each domain a clean folder boundary.

## Backend Connection

The frontend calls the backend through `NEXT_PUBLIC_API_URL`.

By default, `constants/api.ts` falls back to the hosted Render API:

```text
https://team-board-2f94.onrender.com/api
```

For local backend development, set:

```bash
NEXT_PUBLIC_API_URL=http://localhost:9000/api
```

The backend exposes Swagger docs at `/docs`, which is the primary API exploration tool for now.

## Setup

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

Useful scripts:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Design Decisions And Trade-Offs

- **Single Next.js app:** A single deployable frontend is simpler for the current product and keeps routing, deployment, and shared state straightforward.
- **React Query for server state:** Project, member, user, and task data are fetched and cached with React Query instead of hand-written loading and refetch plumbing in every component.
- **Axios service layer:** API logic is kept in `services/` so feature components do not need to know endpoint details.
- **Frontend interfaces are local:** TypeScript interfaces currently live in the frontend. A shared package with the backend would reduce duplication later, but keeping them separate avoids early coupling while the API is still evolving.
- **No Postman collection:** Swagger already covers interactive API testing for the backend. A Postman collection can be added later for QA workflows or scripted regression checks.
- **No Docker Compose:** The frontend can run with Node.js alone and point to either the hosted backend or a local backend. Docker Compose becomes more useful once the full stack includes more infrastructure such as Redis, queues, or workers.
- **No message queues in the UI:** The current UI workflows are request/response CRUD interactions. Real-time updates, notifications, or background job status would be the point where WebSockets, polling, Redis pub/sub, or queues become more valuable.
- **Testing:** Automated frontend tests are not included yet. The next useful layer would be component tests for forms/modals and end-to-end tests for login, project creation, and task movement.

## Deployment Notes

The intended MVP deployment path is Vercel for the frontend and Render for the backend. Configure `NEXT_PUBLIC_API_URL` in the Vercel project environment variables so the deployed frontend talks to the correct backend API.

Before deployment, run:

```bash
npm run lint
npm run build
```
