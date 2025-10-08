# Contributing to VATSIM Flight Analyzer

Thank you for your interest in contributing! 🎉

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/vatsim-flight-analyzer-react.git`
3. Create a branch: `git checkout -b feature/amazing-feature`
4. Install dependencies: `npm install`
5. Start dev server: `npm run dev`

## Development Guidelines

### Code Style

- Use TypeScript for all new files
- Follow React best practices
- Use functional components with hooks
- Use Tailwind CSS for styling (no inline styles)
- Keep components small and focused

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting, missing semicolons, etc.
refactor: code restructuring
test: adding tests
chore: maintenance tasks
```

### Testing

- Write tests for new features
- Run tests before committing: `npm test`
- Ensure type safety: `npm run type-check`
- Run linter: `npm run lint`

### Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Request review from maintainers

## Project Structure

```
src/
├── components/     # React components
├── hooks/         # Custom hooks
├── services/      # API services
├── store/         # State management
├── types/         # TypeScript types
└── utils/         # Utility functions
```

## Key Technologies

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Vitest** - Testing

## Questions?

Open an issue or discussion on GitHub!

## Code of Conduct

Be respectful and constructive in all interactions.
