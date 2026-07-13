# TeamBoard Backend

NestJS API for TeamBoard, a lightweight internal work management platform.

## Current Scope

This backend implements the core API for:

- Signup with name, email, and password
- Login with email and password
- JWT access tokens
- MongoDB-backed users
- Project CRUD and project membership
- Task CRUD, assignment, filtering, and comments
- Swagger API documentation
- Modular Nest libraries for future growth

## Architecture

The backend is a modular monolith built with NestJS and MongoDB. It runs as one deployable API process, but the code is separated by domain so each feature has a clear ownership boundary.

The app entrypoint in `src/` stays thin. It wires configuration, database access, and feature modules together through `AppModule`, while domain and shared code live in Nest workspace libraries:

- `@app/common`: shared database setup, auth decorators, guards, request interfaces
- `@app/users`: user schema and user data access
- `@app/auth`: signup, login, JWT strategy, auth DTOs
- `@app/projects`: project CRUD, membership, ownership checks
- `@app/tasks`: task CRUD, assignment, filtering, comments

Requests enter through HTTP controllers, are validated with DTOs, and then flow into service classes that contain the business rules. Mongoose schemas handle persistence in MongoDB. Protected endpoints use JWT authentication through `JwtAuthGuard`, and project/task access rules are enforced in the service layer so authorization stays close to the domain behavior.

We chose a monolith over microservices because the current feature set is still tightly connected: auth, users, projects, and tasks all depend on the same data model and request lifecycle. Splitting this into services now would add operational cost, network failure modes, distributed tracing, service discovery, duplicated DTO/versioning concerns, and queue infrastructure without solving an immediate product problem.

The monolith is still structured for growth. The library boundaries make it realistic to extract a future service if a specific domain develops an independent scaling or ownership need. For the current requirements, one well-structured API can scale vertically and horizontally behind a load balancer; with database indexing, pagination, stateless JWT auth, and sensible caching added where needed, this architecture should comfortably support an MVP-scale workload of up to roughly 10,000 users before microservices become the main lever.

## Design Decisions And Trade-Offs

- **No microservices yet:** A gateway or service-to-service architecture was intentionally skipped for speed and simplicity. The app does not currently have independent domains that need separate deployment, scaling, or failure isolation.
- **No RabbitMQ or Redis pub/sub yet:** The current workflows are synchronous CRUD operations. Message queues would make sense later for background jobs, notification delivery, audit pipelines, activity feeds, or integrations, but they would add unnecessary moving parts today.
- **No Docker Compose yet:** Local setup only requires Node.js and MongoDB, so the README keeps setup lightweight. Docker Compose would be a good next step if the app adds Redis, queues, workers, or more services.
- **No Postman collection yet:** Swagger already exposes interactive API documentation at `/docs`, which is enough for the current backend surface. A Postman collection can be added later for QA handoff or scripted API workflows.
- **Shared TypeScript interfaces:** Backend DTOs and frontend interfaces are currently maintained separately. This avoids early coupling between the apps, but a shared package would reduce duplication once the API stabilizes.
- **Deployment:** The intended MVP deployment path is Render for the backend and MongoDB Atlas for the database. This keeps hosting simple while leaving room to move to a container-based setup later.
- **Tests:** Minimal unit tests exist for core service behavior. Broader integration/e2e coverage should be added as the API surface settles.

## Setup

```bash
npm install
cp .env.example .env
npm run start:dev
```

Required environment variables:

```bash
PORT=3000
MONGODB_URI=mongodb://localhost:27017/teamboard
JWT_SECRET=replace-me
JWT_EXPIRES_IN=1d
```

## API Docs

Swagger is available at:

```text
http://localhost:3000/docs
```

The API uses a global `/api` prefix.

## Auth Endpoints

### Signup

```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "Ada Lovelace",
  "email": "ada@teamboard.dev",
  "password": "password123"
}
```

Successful response:

```json
{
  "accessToken": "jwt-token",
  "user": {
    "id": "user-id",
    "name": "Ada Lovelace",
    "email": "ada@teamboard.dev"
  }
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "ada@teamboard.dev",
  "password": "password123"
}
```

Successful response uses the same shape as signup.

## Validation And Security Notes

- Passwords are hashed with bcrypt before storage.
- Email addresses are normalized to lowercase before lookup.
- Duplicate signup emails return `409 Conflict`.
- Invalid login credentials return `401 Unauthorized`.
- Protected routes can use `JwtAuthGuard` from `@app/common`.
- CORS is open for MVP development speed.

## Tests

```bash
npm run test
npm run build
```

The current test coverage is intentionally focused on unit tests for core service behavior across the main modules. Broader integration/e2e coverage can be added as the API surface settles.

## Deployment Notes

For the MVP, deploy the backend to Render and use MongoDB Atlas for the production database.

Render settings:

- Build command: `npm install && npm run build`
- Start command: `npm run start:prod`
- Environment variables: use the same keys from `.env.example`
