# Estatefox - Development Guide

## Quick Reference

```bash
# Development (both services)
npm run dev              # Starts backend + frontend concurrently

# Testing
npm test                 # Run all tests
npm run test:backend     # Backend only
npm run test:frontend    # Frontend only

# Type generation (IMPORTANT: run after backend schema changes)
npm run generate:api

# Linting
npm run lint             # Both
npm run lint:backend     # ruff + mypy
npm run lint:frontend    # TypeScript
```

---

## Type-Safe Workflow

Frontend and backend share types through OpenAPI:

```
Backend Pydantic  →  openapi.json  →  Frontend TypeScript
    schemas          (generated)         types
```

### When to Regenerate Types

Run `npm run generate:api` when:
- Adding/modifying Pydantic schemas in backend
- Adding new API endpoints
- Changing response models

### What It Does

1. Runs `python scripts/export-openapi.py` in backend
2. Copies `openapi.json` to frontend
3. Runs `npm run generate:api` in frontend
4. Types appear in `frontend/src/api/generated/`

---

## Working on Backend

Location: `backend/`

### Key Patterns

- All schemas inherit `BaseApiModel` (snake_case → camelCase)
- Routes use explicit `response_model`
- Tests use pytest + TestClient

### Commands

```bash
cd backend
uvicorn src.estatefox_api.main:app --reload
pytest tests/ -v
python scripts/export-openapi.py  # Generate OpenAPI spec
```

### After Schema Changes

```bash
npm run generate:api  # From monorepo root
```

See `backend/CLAUDE.md` for detailed backend patterns.

---

## Working on Frontend

Location: `frontend/`

### Key Patterns

- React Query for data fetching (query key factories)
- MSW for testing API calls
- Factories for test data

### Commands

```bash
cd frontend
npm start           # Expo dev server
npm test           # Jest tests
npm run generate:api  # Generate types (needs openapi.json)
```

See `frontend/CLAUDE.md` for detailed frontend patterns.

---

## CI/CD

### PR Checks (ci.yml)

1. **Backend job**: lint, type check, tests, export OpenAPI spec
2. **Frontend job** (after backend): download spec, generate types, type check, tests

Type generation happens automatically in CI - frontend tests use freshly generated types.

### Deployment (deploy.yml)

- Backend → AWS Lambda (Docker image via ECR)
- Frontend Web → S3 + CloudFront
- Only deploys changed components (path filtering)

---

## Common Workflows

### Adding a New API Endpoint

1. Create schema in `backend/src/.../schemas/`
2. Create route in `backend/src/.../routes/`
3. Register in `backend/src/.../main.py`
4. Add backend tests
5. Run `npm run generate:api` from root
6. Create React Query hook in `frontend/hooks/queries/`
7. Add frontend tests with MSW

### Debugging Type Mismatches

```bash
# Check OpenAPI spec
cat backend/openapi.json | jq '.components.schemas.ItemResponse'

# Regenerate types
npm run generate:api

# Check generated types
cat frontend/src/api/generated/types.ts
```

---

## Deep Dive

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - Monorepo architecture, CI/CD details
- [backend/docs/ARCHITECTURE.md](backend/docs/ARCHITECTURE.md) - Backend patterns, database setup
- [frontend/docs/TESTING.md](frontend/docs/TESTING.md) - Frontend testing patterns
- [frontend/docs/API-CLIENT.md](frontend/docs/API-CLIENT.md) - React Query patterns
