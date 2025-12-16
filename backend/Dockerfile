FROM public.ecr.aws/lambda/python:3.11

# Install uv for fast dependency installation
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Copy dependency files
COPY pyproject.toml README.md ./

# Install dependencies (production only)
RUN uv pip install --system .

# Copy application code
COPY src/ ./src/

# Set the Lambda handler
CMD ["src.estatefox_api.main.handler"]
