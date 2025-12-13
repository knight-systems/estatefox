# Estatefox API

A full-stack real estate application for South Florida property listings, search, and management.

## Quick Start

### Prerequisites

- Python 3.11+
- [uv](https://docs.astral.sh/uv/) package manager
- AWS credentials configured
- Docker (for local Lambda testing)

### Local Development

```bash
# Install dependencies
uv sync

# Run locally with uvicorn
uv run uvicorn src.estatefox_api.main:app --reload --port 8000

# Run tests
uv run pytest

# Type checking
uv run mypy src/

# Linting
uv run ruff check .
uv run ruff format .
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/items` | List all items |
| POST | `/items` | Create an item |
| GET | `/items/{id}` | Get an item |
| PATCH | `/items/{id}` | Update an item |
| DELETE | `/items/{id}` | Delete an item |

### OpenAPI Type Generation

Export the OpenAPI spec for frontend type generation:

```bash
python scripts/export-openapi.py
# Creates openapi.json
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_ENVIRONMENT` | Environment name | `development` |
| `APP_DEBUG` | Enable debug mode | `false` |
| `APP_AWS_REGION` | AWS region | `us-east-1` |

## Deployment

This service deploys automatically to AWS Lambda via GitHub Actions when you push to `main`.

### GitHub Configuration

**Secrets** (Settings → Secrets → Actions):
- `AWS_ROLE_ARN`: IAM role ARN for OIDC authentication

**Variables** (Settings → Variables → Actions):
- `AWS_REGION`: `us-east-1`
- `ECR_REPOSITORY`: ECR repository name (from Terraform output)
- `LAMBDA_FUNCTION_NAME`: Lambda function name (from Terraform output)

### Manual Deployment

```bash
# Build and push Docker image
docker build -t estatefox-api:latest .

# Tag and push to ECR (requires AWS credentials)
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker tag estatefox-api:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/estatefox-api:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/estatefox-api:latest

# Update Lambda
aws lambda update-function-code \
  --function-name estatefox-api \
  --image-uri <account-id>.dkr.ecr.us-east-1.amazonaws.com/estatefox-api:latest
```

## Project Structure

```
estatefox-api/
├── src/
│   └── estatefox_api/
│       ├── __init__.py
│       ├── main.py          # FastAPI app + Lambda handler
│       ├── config.py        # Settings
│       ├── schemas/         # Pydantic schemas (BaseApiModel)
│       ├── routes/          # API endpoints
│       ├── services/        # Business logic
│       └── models/          # Database models (if added)
├── tests/
├── scripts/
│   └── export-openapi.py    # OpenAPI spec generator
├── docs/
│   └── ARCHITECTURE.md      # Detailed patterns guide
├── Dockerfile
├── pyproject.toml
└── README.md
```

## Documentation

- **[Architecture Guide](docs/ARCHITECTURE.md)** - API patterns, schema conventions, database extension guide

## License

Proprietary - Developer
