#!/usr/bin/env bash
set -e

# Colors (only if terminal supports it)
if [ -t 1 ]; then
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[1;33m'
  NC='\033[0m'
else
  RED='' GREEN='' YELLOW='' NC=''
fi

echo -e "${GREEN}🚀 Estatefox Release Script${NC}"
echo ""

# Ensure we're on main and up to date
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
  echo -e "${RED}Error: Must be on main branch (currently on $BRANCH)${NC}"
  exit 1
fi

git fetch origin
if [ "$(git rev-parse HEAD)" != "$(git rev-parse origin/main)" ]; then
  echo -e "${YELLOW}Warning: Local main differs from origin/main${NC}"
  read -p "Continue anyway? [y/N]: " CONFIRM
  [[ ! $CONFIRM =~ ^[Yy]$ ]] && exit 0
fi

# Get current version
CURRENT=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")
echo -e "Current version: ${YELLOW}$CURRENT${NC}"

# Parse current version
VERSION=${CURRENT#v}
IFS='.' read -r MAJOR MINOR PATCH <<< "$VERSION"

# Calculate next versions
NEXT_PATCH="v$MAJOR.$MINOR.$((PATCH + 1))"
NEXT_MINOR="v$MAJOR.$((MINOR + 1)).0"
NEXT_MAJOR="v$((MAJOR + 1)).0.0"

echo ""
echo "Choose release type:"
echo -e "  1) ${GREEN}patch${NC}  → $NEXT_PATCH (bug fixes)"
echo -e "  2) ${YELLOW}minor${NC}  → $NEXT_MINOR (new features)"
echo -e "  3) ${RED}major${NC}  → $NEXT_MAJOR (breaking changes)"
echo "  4) custom"
echo ""
read -p "Selection [1-4]: " CHOICE

case $CHOICE in
  1) NEW_VERSION=$NEXT_PATCH ;;
  2) NEW_VERSION=$NEXT_MINOR ;;
  3) NEW_VERSION=$NEXT_MAJOR ;;
  4) read -p "Enter version (e.g., v1.2.3): " NEW_VERSION ;;
  *) echo "Invalid choice"; exit 1 ;;
esac

echo ""
echo -e "Creating release: ${GREEN}$NEW_VERSION${NC}"
echo ""

# Show commits since last tag
echo "Commits since $CURRENT:"
echo "─────────────────────────────────────"
git log --oneline "$CURRENT"..HEAD 2>/dev/null || git log --oneline -10
echo "─────────────────────────────────────"
echo ""

read -p "Proceed with release? [y/N]: " CONFIRM
if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 0
fi

# Update package.json versions (frontend)
if [ -f "frontend/package.json" ]; then
  cd frontend
  npm version "${NEW_VERSION#v}" --no-git-tag-version
  cd ..
  git add frontend/package.json
fi

# Update pyproject.toml (cross-platform sed)
if [ -f "backend/pyproject.toml" ]; then
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/^version = \".*\"/version = \"${NEW_VERSION#v}\"/" backend/pyproject.toml
  else
    sed -i "s/^version = \".*\"/version = \"${NEW_VERSION#v}\"/" backend/pyproject.toml
  fi
  git add backend/pyproject.toml
fi

# Commit version bumps (if any changes)
if ! git diff --cached --quiet; then
  git commit -m "chore: bump version to $NEW_VERSION"
fi

# Create annotated tag and push
git tag -a "$NEW_VERSION" -m "Release $NEW_VERSION"
git push origin main
git push origin "$NEW_VERSION"

echo ""
echo -e "${GREEN}✅ Release $NEW_VERSION created!${NC}"
echo ""
echo "Next steps:"
echo "  1. GitHub Actions will create the release with auto-generated notes"
echo "  2. Approve the production deployment in GitHub Actions"
echo "  3. View release: https://github.com/knight-systems/estatefox/releases/tag/$NEW_VERSION"
