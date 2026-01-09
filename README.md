# Estatefox

[![CI](https://github.com/knight-systems/estatefox/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/knight-systems/estatefox/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/knight-systems/estatefox/branch/main/graph/badge.svg)](https://codecov.io/gh/knight-systems/estatefox)

A full-stack real estate application for South Florida property listings, search, and management.

## Project Structure

```
estatefox/
├── frontend/          # Expo app (iOS, Android, Web)
│   ├── app/          # Expo Router pages
│   ├── components/   # React components
│   ├── services/     # API client
│   ├── hooks/        # Custom React hooks + React Query
│   ├── tests/        # Jest tests + MSW mocks
│   └── docs/         # Testing & API client guides
├── backend/          # FastAPI service
│   ├── src/          # Python source code
│   │   └── schemas/  # Pydantic schemas (BaseApiModel)
│   ├── tests/        # Pytest tests
│   ├── scripts/      # Utility scripts (OpenAPI export)
│   └── docs/         # Architecture guide
├── docs/             # Monorepo documentation
├── package.json      # Root scripts (dev, test, generate:api)
└── .github/          # CI/CD workflows
```

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)

### Development (Both Services)

```bash
# Install root dependencies
npm install

# Start both frontend and backend in parallel
npm run dev
```

### Frontend Only

```bash
cd frontend
npm install
npm start  # Start Expo dev server
```

**Platform-specific:**
- **Web:** Press `w` in terminal or visit http://localhost:8081
- **iOS:** Press `i` (requires Xcode)
- **Android:** Press `a` (requires Android Studio)

### Backend Only

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
uvicorn src.estatefox_api.main:app --reload
```

API available at http://localhost:8000

## Type-Safe API Communication

Frontend and backend share types through OpenAPI:

```bash
# Generate TypeScript types from backend OpenAPI spec
npm run generate:api

# This command:
# 1. Exports openapi.json from backend (Python)
# 2. Generates TypeScript types in frontend
```

Run this after modifying backend schemas to keep frontend types in sync.

## Running Tests

```bash
# All tests (backend + frontend)
npm test

# Backend only
npm run test:backend

# Frontend only
npm run test:frontend
```

## Deployment

### Frontend (Web)
Frontend web is deployed to S3/CloudFront via GitHub Actions.

### Frontend (Mobile)
iOS and Android builds use EAS Build:
```bash
cd frontend
eas build --platform ios
eas build --platform android
```

### Backend
Backend deploys to AWS Lambda via GitHub Actions.

## Development Workflow

1. Create a feature branch
2. Make changes to frontend and/or backend
3. If you modified backend schemas, run `npm run generate:api`
4. Open a PR - CI will run tests for both
5. Merge to main - deploys automatically

## Documentation

- **[Architecture Guide](docs/ARCHITECTURE.md)** - Monorepo overview, type-safe API patterns, future extensions
- **[Backend Architecture](backend/docs/ARCHITECTURE.md)** - API patterns, schema conventions, database extension
- **[Frontend Testing](frontend/docs/TESTING.md)** - Jest, MSW, test utilities
- **[Frontend API Client](frontend/docs/API-CLIENT.md)** - Type generation, React Query patterns

## Author

Developer <dev@example.com>
# Trigger deploy
