# Fullstack Monorepo Architecture

This document describes the architecture and development workflows for the fullstack monorepo.

## Structure

```
estatefox/
├── frontend/              # Expo app (iOS, Android, Web)
│   ├── app/              # Expo Router pages
│   ├── components/       # React components
│   ├── hooks/           # Custom hooks (including React Query)
│   ├── services/        # API client
│   ├── tests/           # Test infrastructure
│   └── docs/            # Frontend-specific docs
├── backend/              # FastAPI service (Lambda)
│   ├── src/             # Application code
│   ├── tests/           # Backend tests
│   ├── scripts/         # Utility scripts
│   └── docs/            # Backend-specific docs
├── package.json          # Root scripts
├── docs/                # Monorepo-level documentation
└── .github/workflows/
    ├── ci.yml           # PR validation
    └── deploy.yml       # Deployment
```

## Type-Safe API Communication

The frontend and backend share types through OpenAPI specification:

```
┌──────────────┐     ┌────────────────┐     ┌──────────────┐
│   Backend    │     │  openapi.json  │     │   Frontend   │
│   Pydantic   │ ──> │  (shared spec) │ ──> │  TypeScript  │
│   Schemas    │     │                │     │    Types     │
└──────────────┘     └────────────────┘     └──────────────┘
```

### Workflow

1. **Define schemas in backend** (`backend/src/.../schemas/`)
2. **Export OpenAPI spec** (`python scripts/export-openapi.py`)
3. **Generate TypeScript types** (`npm run generate:api`)
4. **Use types in React Query hooks** (`frontend/hooks/queries/`)

### Commands

```bash
# Generate types after backend changes
npm run generate:api

# This runs:
# 1. cd backend && python scripts/export-openapi.py
# 2. cp backend/openapi.json frontend/
# 3. cd frontend && npm run generate:api
```

### CI Automation

The CI workflow automatically:

1. Runs backend tests
2. Exports OpenAPI spec
3. Generates frontend types
4. Runs frontend tests with type checking

This ensures types stay in sync across PRs.

## Development

### Start Both Services

```bash
npm run dev
```

This uses `concurrently` to run:
- Backend: `uvicorn` with hot reload on port 8000
- Frontend: `expo start`

### Run Tests

```bash
# Both frontend and backend
npm test

# Backend only
npm run test:backend

# Frontend only
npm run test:frontend
```

### Linting

```bash
# Both
npm run lint

# Individual
npm run lint:backend  # ruff + mypy
npm run lint:frontend # eslint (if configured)
```

### Type Checking

```bash
npm run typecheck  # Frontend TypeScript
```

## API Patterns

### Backend (FastAPI + Pydantic)

Schemas use `BaseApiModel` for automatic camelCase conversion:

```python
# backend/src/.../schemas/users.py
from .base import BaseApiModel

class UserResponse(BaseApiModel):
    user_name: str      # JSON: userName
    created_at: datetime  # JSON: createdAt
```

See `backend/docs/ARCHITECTURE.md` for detailed patterns.

### Frontend (React Query)

Hooks use query key factories for consistent caching:

```typescript
// frontend/hooks/queries/useUsers.ts
export const userKeys = {
  all: ['users'] as const,
  detail: (id: string) => [...userKeys.all, id] as const,
};

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => api.get<UserResponse>(`/users/${id}`),
  });
}
```

See `frontend/docs/API-CLIENT.md` for detailed patterns.

## Testing

### Backend

- **pytest** for unit tests
- **httpx** for API testing
- **moto** for AWS mocking

```bash
cd backend && pytest tests/ -v
```

### Frontend

- **Jest** with `jest-expo` preset
- **React Native Testing Library** for components
- **MSW** for API mocking

```bash
cd frontend && npm test
```

See `frontend/docs/TESTING.md` for detailed patterns.

## CI/CD

### Pull Request Checks

The `ci.yml` workflow runs on every PR:

1. **Backend job:**
   - Lint (ruff)
   - Type check (mypy)
   - Unit tests
   - Export OpenAPI spec

2. **Frontend job** (depends on backend):
   - Download OpenAPI spec
   - Generate types
   - Type check (tsc)
   - Unit tests

### Deployment

The `deploy.yml` workflow runs on main branch:

- **Change detection:** Only deploys modified components
- **Backend:** Build Docker → Push to ECR → Update Lambda
- **Frontend:** Build web → Deploy to S3 → Invalidate CloudFront

## Future Extensions

### Adding a Database

See `backend/docs/ARCHITECTURE.md` for SQLAlchemy + Alembic setup.

Key steps:
1. Add SQLAlchemy dependencies
2. Create db/ module with engine, models, session
3. Update routes to use database
4. Set up Alembic migrations

### Adding Storybook

See `frontend/docs/TESTING.md` for Storybook setup.

Key steps:
1. Initialize Storybook for React Native
2. Configure MSW integration
3. Create stories with play functions

### Adding E2E Tests

Consider Detox for cross-platform E2E testing:

1. Install Detox
2. Configure for iOS/Android simulators
3. Write E2E tests covering full-stack flows

Example E2E test:

```typescript
describe('Items Flow', () => {
  it('should create and display an item', async () => {
    // Start at home screen
    await expect(element(by.id('items-list'))).toBeVisible();

    // Create new item
    await element(by.id('add-button')).tap();
    await element(by.id('name-input')).typeText('Test Item');
    await element(by.id('save-button')).tap();

    // Verify item appears in list
    await expect(element(by.text('Test Item'))).toBeVisible();
  });
});
```

### Adding Authentication

For adding auth:

1. **Backend:**
   - Add JWT dependency
   - Create auth routes (login, register, refresh)
   - Add auth middleware

2. **Frontend:**
   - Create auth context
   - Add token storage (secure storage)
   - Update API client to include tokens
   - Add protected routes

## Environment Variables

### Backend

Create `backend/.env`:

```bash
ENVIRONMENT=development
DEBUG=true
CORS_ORIGINS=http://localhost:8081
```

### Frontend

Create `frontend/.env`:

```bash
API_BASE_URL=http://localhost:8000
```

### CI/CD Secrets

Required GitHub secrets for deployment:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `ECR_REGISTRY`
- `S3_BUCKET_NAME`
- `CLOUDFRONT_DISTRIBUTION_ID`
