# Estatefox

A full-stack real estate application for South Florida property listings, search, and management.

## Overview

This is a **universal React Native app** that runs on:
- **iOS** - Native app via EAS Build → App Store
- **Android** - Native app via EAS Build → Google Play
- **Web** - Static export via Expo → S3 + CloudFront

One codebase, three platforms.

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- Expo account (https://expo.dev)

### Installation

```bash
npm install
```

### Development

```bash
# Start development server (choose platform from menu)
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run in web browser
npm run web

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### API Type Generation

Generate TypeScript types from the backend OpenAPI spec:

```bash
# From local spec
npm run generate:api

# From remote URL
OPENAPI_URL=https://api.example.com/openapi.json npm run generate:api
```

## Building & Deployment

### iOS & Android (via EAS Build)

```bash
# Login to Expo
eas login

# Configure the project (first time only)
eas build:configure

# Development build (with dev tools)
eas build --platform all --profile development

# Preview build (for internal testing)
eas build --platform all --profile preview

# Production build
eas build --platform all --profile production
```

### Web (via Expo Export → S3/CloudFront)

```bash
# Build static web export
npm run build:web

# Output is in dist/ directory
```

Web deployment is automated via GitHub Actions on merge to main.

### App Store Submission

```bash
# iOS (App Store)
eas submit --platform ios

# Android (Google Play)
eas submit --platform android
```

## Project Structure

```
app/                    # expo-router file-based routing
├── _layout.tsx         # Root layout (QueryClientProvider)
├── index.tsx           # Entry point
├── (tabs)/             # Tab navigation
│   ├── home.tsx
│   └── settings.tsx
└── (auth)/             # Auth stack
    ├── login.tsx
    └── register.tsx
components/ui/          # Reusable UI components
services/               # API client
hooks/
├── useApi.ts           # Base API hook
└── queries/            # React Query hooks
    └── useItems.ts     # Example CRUD hooks
src/api/generated/      # Generated types from OpenAPI
tests/
├── mocks/              # MSW handlers and mock database
├── factories/          # Test data factories
├── utils/              # Test utilities with providers
├── components/         # Component tests
└── hooks/              # Hook tests
docs/
├── TESTING.md          # Testing patterns guide
└── API-CLIENT.md       # Type generation and React Query patterns
```

## CI/CD Setup

This project has **three deployment pipelines**:

| Platform | Workflow | Trigger | Destination |
|----------|----------|---------|-------------|
| iOS/Android | `eas-build.yml` | Push/PR | EAS Build |
| iOS/Android | `eas-submit.yml` | Manual | App Stores |
| Web | `deploy-web.yml` | Push to main | S3 + CloudFront |

### Required Secrets & Variables

**GitHub Secrets:**
- `EXPO_TOKEN` - Expo access token ([create here](https://expo.dev/accounts/toolkmit/settings/access-tokens))
- `AWS_ROLE_ARN` - IAM role ARN for GitHub OIDC (from agent-platform Terraform)

**GitHub Variables:**
- `S3_BUCKET` - S3 bucket name for web hosting
- `CLOUDFRONT_DISTRIBUTION_ID` - CloudFront distribution ID
- `CLOUDFRONT_DOMAIN` - CloudFront domain (e.g., `d1234567890.cloudfront.net`)

### Infrastructure Setup (Web)

Web hosting requires S3 + CloudFront infrastructure. Create via agent-platform:

1. Add static-site module to `agent-platform/infra/terraform/main.tf`:
   ```hcl
   module "static_site_estatefox" {
     source    = "./modules/static-site"
     site_name = "estatefox"
   }
   ```

2. Merge PR → Terraform creates S3 bucket + CloudFront distribution

3. Configure GitHub repo with outputs:
   - `S3_BUCKET` from Terraform output
   - `CLOUDFRONT_DISTRIBUTION_ID` from Terraform output
   - `CLOUDFRONT_DOMAIN` from Terraform output

## Environment Variables

Configure in `eas.json` for native builds or via Expo Constants:

- `API_BASE_URL` - Backend API endpoint (default: https://api.estatefox.example.com)

## Documentation

- **[Testing Guide](docs/TESTING.md)** - Jest, MSW, factories, test utilities
- **[API Client Guide](docs/API-CLIENT.md)** - Type generation, React Query patterns

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [expo-router Documentation](https://docs.expo.dev/router/introduction/)
- [React Native for Web](https://necolas.github.io/react-native-web/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [MSW Documentation](https://mswjs.io/)

## License

MIT
