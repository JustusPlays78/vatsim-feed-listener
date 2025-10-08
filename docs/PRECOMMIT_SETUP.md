# 📦 Installation Guide

## Step-by-Step Installation

### 1. Install Pre-Commit Dependencies

```bash
npm install --save-dev husky@^8.0.3 lint-staged@^15.2.0
```

### 2. Initialize Husky

```bash
npm run prepare
```

This will:

- Setup Git hooks directory (`.husky/`)
- Create pre-commit hook
- Enable automatic checks before commits

### 3. Verify Installation

```bash
# Check if hooks are installed
ls -la .husky/

# Test pre-commit manually
npm run precommit
```

### 4. Optional: Setup Deploy Scripts Permissions (Linux/Mac)

```bash
chmod +x deploy.sh
chmod +x setup.sh
chmod +x .husky/pre-commit
```

## What Gets Installed?

### Husky (v8.0.3)

- Git hooks manager
- Runs checks before commits
- Prevents bad code from being committed

### Lint-Staged (v15.2.0)

- Runs linters on staged files only
- Auto-formats code before commit
- Faster than checking entire codebase

## Pre-Commit Hook Details

The hook runs these checks:

1. **TypeScript Type Check** (`npm run type-check`)
   - Ensures no type errors
   - Validates TypeScript configuration
   - Prevents type-related bugs

2. **ESLint** (`npm run lint`)
   - Code quality checks
   - Style consistency
   - Best practices enforcement
   - Max 0 warnings allowed

3. **Lint-Staged**
   - Formats TypeScript/TSX files with ESLint + Prettier
   - Formats JSON, Markdown, YAML files with Prettier
   - Only processes staged files (fast!)

## Package.json Configuration

```json
{
  "scripts": {
    "prepare": "husky install",
    "precommit": "npm run type-check && npm run lint",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "type-check": "tsc --noEmit"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
```

## Bypass Pre-Commit (Emergency Only)

If you absolutely need to commit without checks:

```bash
git commit --no-verify -m "emergency fix"
```

⚠️ **Warning**: Only use this for:

- Hotfixes in production emergencies
- Reverting broken commits
- When CI/CD will catch issues anyway

## Troubleshooting

### Husky not running

```bash
# Reinstall hooks
rm -rf .husky
npm run prepare
```

### Lint-staged not found

```bash
# Reinstall dependencies
npm ci
```

### Permission denied (Linux/Mac)

```bash
chmod +x .husky/pre-commit
```

### Hooks not triggering

```bash
# Check Git hooks path
git config core.hooksPath

# Should output: .husky
# If not, run:
npx husky install
```

## Continuous Integration

The same checks run on:

- ✅ Local pre-commit (via Husky)
- ✅ GitHub Actions CI/CD pipeline
- ✅ Before Docker builds

This ensures code quality at every step! 🎯
