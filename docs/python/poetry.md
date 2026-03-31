---
title: Package Management (Poetry)
prev:
    link: '/python/httpx'
    text: 'Async HTTP (httpx)'
next:
    link: '/python/fastapi'
    text: 'FastAPI'
---

# Poetry

Python dependency management and packaging.

## Installation

```bash
# macOS
brew install poetry

# Windows
pip install poetry

# Linux
curl -sSL https://install.python-poetry.org | python3 -
```

## Basic Usage

```bash
# Initialize new project
poetry new my-project

# Initialize in existing directory
poetry init

# Install dependencies
poetry install

# Add dependency
poetry add requests
poetry add pytest --group dev

# Add dev dependency
poetry add black --group dev

# Remove dependency
poetry remove requests

# Update all
poetry update
```

## pyproject.toml

```toml
[tool.poetry]
name = "my-project"
version = "0.1.0"
description = "A short description"
authors = ["Your Name <you@example.com>"]
readme = "README.md"
packages = [{include = "my_project"}]

[tool.poetry.dependencies]
python = "^3.9"
requests = "^2.28"
flask = {version = "^2.0", extras = ["dotenv"]}

[tool.poetry.group.dev.dependencies]
pytest = "^7.0"
black = "^23.0"
ruff = "^0.1"

[tool.poetry.scripts]
my-script = "my_project.main:main"

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
```

## Virtual Environments

```bash
# Create virtual environment
poetry env use python3.11

# Activate virtual environment
poetry shell

# Run command in environment
poetry run python script.py
poetry run pytest

# Show virtual environment path
poetry env info

# List environments
poetry env list
```

## Lock File

```bash
# Install from lock file
poetry install

# Update lock file
poetry lock

# Update without lock
poetry update --no-update
```

## Dependency Groups

```python
# pyproject.toml
[tool.poetry.group.test]
optional = true

[tool.poetry.group.test.dependencies]
pytest-cov = "^4.0"

[tool.poetry.group.lint]
optional = true

[tool.poetry.group.lint.dependencies]
ruff = "^0.1"

# Install optional groups
poetry install --with test
poetry install --all-extras
```

## Scripts

```toml
[tool.poetry.scripts]
my-app = "my_app.main:main"
cli = "my_app.cli:main"

# Run scripts
poetry run my-app
poetry run cli
```

## Export

```bash
# Export to requirements.txt
poetry export -f requirements.txt --output requirements.txt
poetry export -f requirements.txt --without-hashes --output requirements.txt
```

## Plugins

```bash
# Install plugin
poetry add poetry-plugin-export --group dev

# Export with restrictions
poetry export -f requirements.txt --with test
```

## Version Constraints

```toml
[tool.poetry.dependencies]
# Exact version
package = "1.0.0"

# Range
package = "^1.0"     # >=1.0, <2.0
package = "~1.0"     # >=1.0, <1.1
package = ">=1.0"    # >=1.0
package = "<2.0"     # <2.0

# OR
package = "1.0 || 2.0"  # 1.0 or 2.0

# Wildcard
package = "1.*"     # >=1.0, <2.0
```

## Publishing

```bash
# Build package
poetry build

# Publish to PyPI
poetry publish

# Publish to private repo
poetry publish --repository my-repo
```

## Using in CI/CD

```yaml
# GitHub Actions
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install poetry
      - run: poetry install
      - run: poetry run pytest
```

## Virtual Environment Locations

```bash
# Default: in project directory
poetry config virtualenvs.in-project true

# Or global
poetry config virtualenvs.in-project false
```

## Best Practices

```bash
# 1. Use lock file in production
poetry lock --no-update  # Update lock without updating deps
poetry install --no-dev  # Exclude dev dependencies

# 2. Check for vulnerabilities
poetry check

# 3. Show dependency tree
poetry show --tree
poetry show requests

# 4. Find outdated packages
poetry outdated

# 5. Add git dependencies
poetry add git+https://github.com/user/repo.git#tag
poetry add git+https://github.com/user/repo.git#subdirectory=package
```

## Common Commands

```bash
poetry add requests@^2.28       # Add specific version
poetry add --group db pymongo   # Add to specific group
poetry remove requests          # Remove package
poetry search requests         # Search PyPI
poetry lock                    # Update lock file
poetry install                 # Install from lock
poetry update                  # Update packages
poetry run pytest              # Run command
poetry shell                   # Activate shell
poetry env info                # Env info
```