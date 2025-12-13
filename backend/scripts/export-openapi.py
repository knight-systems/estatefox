#!/usr/bin/env python3
"""Export OpenAPI specification to JSON file.

This script generates an openapi.json file from the FastAPI application.
The generated spec can be used by frontend tools to generate TypeScript types.

Usage:
    python scripts/export-openapi.py

Output:
    openapi.json in the project root

For fullstack monorepo:
    The frontend can run `npm run generate:api` to generate types from this spec.
"""

import json
import sys
from pathlib import Path

# Add src to path so we can import the app
src_path = Path(__file__).parent.parent / "src"
sys.path.insert(0, str(src_path))

from estatefox_api.main import app  # noqa: E402


def main() -> None:
    """Export OpenAPI spec to openapi.json."""
    spec = app.openapi()

    output_path = Path(__file__).parent.parent / "openapi.json"
    output_path.write_text(json.dumps(spec, indent=2))

    print(f"OpenAPI spec exported to {output_path}")
    print(f"  Title: {spec.get('info', {}).get('title')}")
    print(f"  Version: {spec.get('info', {}).get('version')}")
    print(f"  Paths: {len(spec.get('paths', {}))}")


if __name__ == "__main__":
    main()
