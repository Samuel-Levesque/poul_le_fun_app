# Frontend Test Suite

Comprehensive test suite for the Poul le Fun frontend application.

## Test Structure

```
src/
├── api/__tests__/
│   ├── teams.test.ts       # Tests for teams API client
│   ├── games.test.ts       # Tests for games API client
│   └── results.test.ts     # Tests for results API client
└── components/
    ├── CurrentGames/__tests__/
    │   └── GameCard.test.tsx
    └── TeamCreation/__tests__/
        └── TeamList.test.tsx
```

## Running Tests

### Install Dependencies

```bash
cd frontend
npm install
```

### Run All Tests

```bash
npm test
```

### Run with UI

```bash
npm run test:ui
```

### Run with Coverage

```bash
npm run test:coverage
```

### Watch Mode

```bash
npm test -- --watch
```

## Test Utilities

### Custom Render

The `testUtils.tsx` file provides a custom render function that wraps components with necessary providers (React Router, etc.):

```typescript
import { render, screen } from '../../test/testUtils'
```

### Mocking

- **API Calls**: Use Vitest's `vi.mock()` to mock API modules
- **Components**: Mock child components to isolate unit tests
- **User Interactions**: Use `@testing-library/user-event` for realistic interactions

## Test Categories

### API Client Tests
- **Teams API**: Team creation, listing, deletion
- **Games API**: Game generation, manual creation, status updates
- **Results API**: Result submission, rankings, match matrix

### Component Tests
- **GameCard**: Game display, result entry dialog
- **TeamList**: Team listing, deletion with confirmation

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Use `afterEach(() => cleanup())` to clean up after tests
3. **User-Centric**: Test from user's perspective using Testing Library queries
4. **Async**: Use `waitFor` and `async/await` for asynchronous operations
5. **Mocking**: Mock external dependencies and API calls

## Coverage Goals

- **API Client Layer**: 90%+
- **Components**: 80%+
- **User Interactions**: Cover all interactive flows
