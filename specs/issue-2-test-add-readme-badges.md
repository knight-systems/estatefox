# Test: Add README badges - v1

**Issue:** #2
**Generated:** 2025-12-13 08:11
**Version:** 1

## Problem

Add build status and coverage badges to the README.md file.

## Goals

- [ ] Add Build Status Badge to Root README
- [ ] Add Codecov Coverage Badge to Root README
- [ ] Add Blank Line Separator After Badges
- [ ] Verify Codecov Repository Setup
- [ ] Test Badge Rendering Locally

## Non-goals

- [To be determined based on scope discussions]

## Requirements

- R1: Add Build Status Badge to Root README (`/Users/marcknight/Dropbox/web-projects/agent-platform/trees/26d56fa6/README.md`)
- R2: Add Codecov Coverage Badge to Root README (`/Users/marcknight/Dropbox/web-projects/agent-platform/trees/26d56fa6/README.md`)
- R3: Add Blank Line Separator After Badges (`/Users/marcknight/Dropbox/web-projects/agent-platform/trees/26d56fa6/README.md`)
- R4: Verify Codecov Repository Setup
- R5: Test Badge Rendering Locally (`/Users/marcknight/Dropbox/web-projects/agent-platform/trees/26d56fa6/README.md`)

## Open Questions

- [Discovered during research - TBD]

## Implementation Notes

Excellent! Now I have enough information. Let me compile the research notes:

---

# Research Notes: README Badges Integration

## Facts

The Estatefox monorepo is a full-stack real estate application with a comprehensive CI/CD and testing setup that supports badge generation. The main README.md file currently has NO badges, despite having build and coverage infrastructure in place.

### Repository Information
- **GitHub Repository**: `https://github.com/knight-systems/estatefox` (from `git remote -v`)
- **Main README location**: `/Users/marcknight/Dropbox/web-projects/agent-platform/trees/26d56fa6/README.md` (lines 1-133)
- **Current state**: No badges present in any of the three README files (root, backend, frontend)

### CI/CD Build Status Infrastructure
The monorepo has **three separate CI pipelines** configured:

**Root-level CI** (`.github/workflows/ci.yml` lines 1-87):
- Tests both backend and frontend together
- Backend runs with `pytest` (line 37: `pytest tests/ -v --cov=src/estatefox_api`)
- Frontend runs with `npm test -- --coverage` (line 86)

**Backend CI** (`backend/.github/workflows/ci.yml` lines 1-47):
- Uses `uv` package manager for Python dependency management
- Runs linting with `ruff check .` (line 31)
- Runs formatting check with `ruff format --check .` (line 34)
- Runs type checking with `mypy src/` (line 37)
- Runs tests with `pytest tests/ -v --cov=src/estatefox_api --cov-report=xml` (line 40)
- **Uploads coverage to Codecov** via `codecov/codecov-action@v4` (lines 42-46, file `./coverage.xml`)

**Frontend CI** (`frontend/.github/workflows/ci.yml` lines 1-40):
- Runs linting (line 27: `npm run lint`)
- Runs type checking (line 30: `npm run tsc`)
- Runs tests with `npm test -- --coverage --watchAll=false` (line 33)
- **Uploads coverage to Codecov** via `codecov/codecov-action@v4` (lines 35-39, file `./coverage/lcov.info`)

### Coverage Infrastructure
Both backend and frontend upload coverage reports to Codecov:
- Backend: XML coverage report at `./coverage.xml` (backend/.github/workflows/ci.yml:45)
- Frontend: LCOV coverage report at `./coverage/lcov.info` (frontend/.github/workflows/ci.yml:38)
- Both use `codecov/codecov-action@v4` (no error on failure: `fail_ci_if_error: false`)

### Coverage Configuration Details
**Frontend** (`frontend/jest.config.js` lines 17-33):
- Jest is configured to collect coverage from:
  - `components/**/*.{ts,tsx}`
  - `hooks/**/*.{ts,tsx}`
  - `services/**/*.{ts,tsx}`
  - `app/**/*.{ts,tsx}`
  - Excludes: `**/*.d.ts`, `**/node_modules/**`, `src/api/generated/**`
- Coverage thresholds (global):
  - branches: 70%
  - functions: 70%
  - lines: 70%
  - statements: 70%

**Backend** (`backend/pyproject.toml` lines 49-52):
- Pytest configuration specifies:
  - asyncio_mode: "auto"
  - testpaths: ["tests"]
- Test coverage is generated via `--cov=src/estatefox_api --cov-report=xml` (backend/.github/workflows/ci.yml:40)

### Build Status Triggers
Both frontend and backend CI workflows trigger on:
- Push to `main` branch
- Pull requests to `main` branch

### Test Commands
**Root-level** (`package.json` lines 9-11):
- `npm test` → runs both backend and frontend tests
- `npm run test:backend` → `cd backend && pytest tests/ -v`
- `npm run test:frontend` → `cd frontend && npm test`

**Frontend** (`frontend/package.json` lines 14-16):
- `npm test` → jest
- `npm test:watch` → jest --watch
- `npm test:coverage` → jest --coverage

## File Map

| File | Purpose | Key References |
|------|---------|-----------------|
| `README.md:1-133` | Root monorepo documentation | Project structure, quick start, workflows |
| `.github/workflows/ci.yml:1-87` | Root CI pipeline for both services | Backend + frontend tests, OpenAPI generation |
| `backend/.github/workflows/ci.yml:1-47` | Backend-specific CI | Ruff lint, mypy check, pytest + coverage upload to Codecov |
| `frontend/.github/workflows/ci.yml:1-40` | Frontend-specific CI | Type check, tests + coverage upload to Codecov |
| `backend/pyproject.toml:49-52` | Backend test configuration | pytest asyncio_mode, testpaths |
| `frontend/jest.config.js:1-37` | Frontend test configuration | Coverage collection, 70% thresholds, test patterns |
| `backend/README.md:1-123` | Backend-specific documentation | No badges currently |
| `frontend/README.md:1-198` | Frontend-specific documentation | CI/CD deployment table, no badges |
| `.gitignore:25-28` | Git ignore patterns | Explicitly ignores coverage directories: `.coverage`, `coverage/`, `htmlcov/` |

## Invariants

1. **Coverage is generated and uploaded**: Both backend and frontend CI workflows generate coverage reports and upload to Codecov (lines 42-46 and 35-39 respectively)
2. **Coverage thresholds are enforced**: Frontend has global coverage thresholds of 70% (jest.config.js:26-33)
3. **CI triggers on main/PR**: All workflows run on push to main and pull requests to main (ci.yml files)
4. **Monorepo structure**: Root orchestrates both services via concurrently (package.json:6)
5. **Build status available via GitHub Actions**: All workflows are public GitHub Actions that succeed/fail visibly
6. **Codecov integration exists**: Both services already integrate with Codecov via `codecov/codecov-action@v4`

## Patterns

### Markdown Documentation
- README files use standard Markdown with code blocks (triple backticks)
- Project structure documented as ASCII tree diagrams (README.md:7-25)
- Tables used for API endpoints and CI/CD platforms (backend/README.md:36-43, frontend/README.md:139-143)
- Installation and quick start sections appear at the top

### CI/CD Patterns
- Separate workflows per component (root, backend, frontend)
- Shared pattern: Checkout → Setup environment → Install deps → Lint → Type check → Test + coverage → Upload coverage
- Codecov integration is consistent: `codecov/codecov-action@v4` with XML/LCOV coverage reports
- All workflows run on both `push` and `pull_request` events to `main` branch

### Badge Markdown Format
Standard GitHub badge syntax (not yet used in this codebase):
- Markdown link with alt text: `![Badge Name](badge_url)`
- Common badge sources: shields.io, GitHub Actions status, Codecov

## Risks

1. **No existing badge infrastructure**: The README files contain no badge markdown, requiring new additions
2. **Three separate README files**: Root, backend, and frontend READMEs exist independently - unclear which should receive badges and whether to badge all three
3. **Coverage tools are separate**: Frontend uses Jest/LCOV format, backend uses pytest/XML format - each may need distinct badge integrations
4. **Codecov already integrated but not badged**: Codecov infrastructure exists (codecov/codecov-action@v4) but no corresponding badge in README
5. **GitHub Actions workflows are decoupled**: Three separate CI workflows (.github/workflows/ci.yml at root, backend, frontend) - unclear which build status badge to display
6. **No documented badge placement convention**: No existing pattern or guidance on where badges should appear in the project's README files

## Implementation Plan

Now I have all the information needed to create a comprehensive implementation plan. Here is the detailed plan:

---

## Summary

This implementation adds build status and coverage badges to the root `README.md` file for the Estatefox monorepo. The project is hosted at `github.com/knight-systems/estatefox` and has CI workflows at three levels (root, backend, frontend). Since the root-level CI workflow (`.github/workflows/ci.yml`) tests both backend and frontend together, we'll use the root CI workflow badge for build status. For coverage, we'll add a Codecov badge since both backend and frontend already upload coverage reports to Codecov via `codecov/codecov-action@v4`. Badges will be placed at the top of the README, immediately after the main heading, following standard open-source conventions.

---

## Task 1: Add Build Status Badge to Root README

- **Description**: Add a GitHub Actions workflow status badge showing the CI build status for the main branch. This badge will reflect the root-level CI pipeline that tests both backend and frontend.

- **File(s)**: `/Users/marcknight/Dropbox/web-projects/agent-platform/trees/26d56fa6/README.md`

- **Code**: Insert the following after line 1 (`# Estatefox`):

```markdown
# Estatefox

[![CI](https://github.com/knight-systems/estatefox/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/knight-systems/estatefox/actions/workflows/ci.yml)
```

- **Verification**: 
  1. View the README.md file and confirm the badge markdown is present after the heading
  2. Push changes and verify the badge renders correctly on GitHub
  3. Confirm the badge links to the correct Actions workflow page

---

## Task 2: Add Codecov Coverage Badge to Root README

- **Description**: Add a Codecov coverage badge showing the overall test coverage percentage. This leverages the existing Codecov integration where both backend and frontend upload coverage reports.

- **File(s)**: `/Users/marcknight/Dropbox/web-projects/agent-platform/trees/26d56fa6/README.md`

- **Code**: Update the badge section to include the coverage badge:

```markdown
# Estatefox

[![CI](https://github.com/knight-systems/estatefox/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/knight-systems/estatefox/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/knight-systems/estatefox/graph/badge.svg)](https://codecov.io/gh/knight-systems/estatefox)
```

- **Verification**:
  1. Confirm the badge markdown is correctly formatted
  2. Push changes and verify the badge renders on GitHub
  3. Click the badge to verify it links to the Codecov dashboard for the repository

---

## Task 3: Add Blank Line Separator After Badges

- **Description**: Add proper spacing between the badges and the project description to ensure clean visual formatting and maintain markdown best practices.

- **File(s)**: `/Users/marcknight/Dropbox/web-projects/agent-platform/trees/26d56fa6/README.md`

- **Code**: The complete badge section should look like:

```markdown
# Estatefox

[![CI](https://github.com/knight-systems/estatefox/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/knight-systems/estatefox/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/knight-systems/estatefox/graph/badge.svg)](https://codecov.io/gh/knight-systems/estatefox)

A full-stack real estate application for South Florida property listings, search, and management.
```

- **Verification**:
  1. Open the README in a markdown previewer
  2. Confirm badges appear on a separate line from the description
  3. Verify proper visual spacing between sections

---

## Task 4: Verify Codecov Repository Setup

- **Description**: Ensure the Codecov repository is properly configured to generate valid badges. The CI workflows already upload coverage, but the repository token may need to be verified or the repository needs to be public/authorized on Codecov.

- **File(s)**: N/A (verification task, no file changes)

- **Code**: N/A

- **Verification**:
  1. Visit `https://codecov.io/gh/knight-systems/estatefox` to confirm the repository is tracked
  2. Check that coverage reports have been successfully uploaded (visible in Codecov dashboard)
  3. If the badge shows "unknown" status, verify the `CODECOV_TOKEN` secret is configured in GitHub repository settings

---

## Task 5: Test Badge Rendering Locally

- **Description**: Validate the badge markdown renders correctly before pushing to GitHub by using a local markdown preview tool.

- **File(s)**: `/Users/marcknight/Dropbox/web-projects/agent-platform/trees/26d56fa6/README.md`

- **Code**: Complete updated README.md header section:

```markdown
# Estatefox

[![CI](https://github.com/knight-systems/estatefox/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/knight-systems/estatefox/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/knight-systems/estatefox/graph/badge.svg)](https://codecov.io/gh/knight-systems/estatefox)

A full-stack real estate application for South Florida property listings, search, and management.

## Project Structure
```

- **Verification**:
  1. Open README.md in VS Code or another editor with markdown preview
  2. Confirm both badge images render (may show as broken images locally if URLs require authentication)
  3. Verify markdown syntax is correct with no linting errors

---

## Testing Strategy

1. **Visual Verification**: After pushing changes, view the repository's main page on GitHub to confirm:
   - Both badges render correctly as clickable images
   - The CI badge shows the current build status (passing/failing)
   - The Codecov badge shows a coverage percentage or "unknown" (if coverage hasn't been uploaded yet)

2. **Link Verification**: Click each badge to ensure:
   - CI badge links to: `https://github.com/knight-systems/estatefox/actions/workflows/ci.yml`
   - Codecov badge links to: `https://codecov.io/gh/knight-systems/estatefox`

3. **Build Status Accuracy**: Trigger the CI workflow (via a push or PR) and verify the badge updates to reflect the new status.

4. **Coverage Integration Check**: After a successful CI run that uploads coverage, verify the Codecov badge updates to show the actual coverage percentage.

---

## Risks

1. **Codecov Badge Shows "Unknown"**
   - **Risk**: If the repository isn't registered with Codecov or coverage hasn't been uploaded, the badge will show "unknown"
   - **Mitigation**: Verify Codecov setup by checking `https://codecov.io/gh/knight-systems/estatefox`; ensure `CODECOV_TOKEN` is set as a GitHub secret if the repo is private

2. **Private Repository Badge Access**
   - **Risk**: If the repository is private, badges may not render publicly without authentication tokens
   - **Mitigation**: For private repos, use Codecov's token-authenticated badge URLs or shields.io with secret tokens

3. **Workflow Name Changes**
   - **Risk**: If the CI workflow file is renamed from `ci.yml`, the badge URL will break
   - **Mitigation**: The badge URL uses the workflow filename; document this dependency in comments if needed

4. **Branch Name Changes**
   - **Risk**: The badge is configured for `?branch=main`; if the default branch changes, the badge may show stale status
   - **Mitigation**: Update the badge URL if the default branch ever changes from `main`

## Task List

- [ ] Add Build Status Badge to Root README
- [ ] Add Codecov Coverage Badge to Root README
- [ ] Add Blank Line Separator After Badges
- [ ] Verify Codecov Repository Setup
- [ ] Test Badge Rendering Locally

---
_Generated by SDLC Agent - OpenSpec Pattern_
