# TeamBoard Backend

NestJS API for TeamBoard, a lightweight internal work management platform.

## Current Scope

This slice implements authentication first:

- Signup with name, email, and password
- Login with email and password
- JWT access tokens
- MongoDB-backed users
- Swagger API documentation
- Modular Nest libraries for future growth

## Architecture

The backend is a modular monolith. The app entrypoint in `src/` stays thin, while domain and shared code live in Nest workspace libraries:

- `@app/common`: shared database setup, auth decorators, guards, request interfaces
- `@app/users`: user schema and user data access
- `@app/auth`: signup, login, JWT strategy, auth DTOs
- `@app/projects`: reserved for project management
- `@app/tasks`: reserved for task management

This keeps development fast for the MVP while preserving boundaries that can later map to separate services.

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

The current test coverage is intentionally focused on simple unit tests for the auth slice and user data-access behavior.

## Deployment Notes

For the MVP, deploy the backend to Render and use MongoDB Atlas for the production database.

Render settings:

- Build command: `npm install && npm run build`
- Start command: `npm run start:prod`
- Environment variables: use the same keys from `.env.example`
