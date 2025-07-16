# Sykell Crawler E2E Tests - Happy Path Testing

This directory contains well-structured, maintainable end-to-end tests for the Sykell Crawler application using Playwright, covering happy path scenarios with modern testing patterns.

## Test Architecture

### Design Patterns

- **Page Object Model**: Encapsulated page interactions in reusable classes
- **Configuration Constants**: Centralized selectors, timeouts, and URL patterns
- **Type Safety**: Full TypeScript support with proper interfaces
- **Modular Design**: Shared components across test files for consistency

### Main Test Files

1. **`user-journey.spec.ts`** - Complete end-to-end user journey covering all 9 scenarios:

   - User registration
   - User login
   - Creating 10 crawls
   - Viewing crawl details
   - Navigating back to dashboard
   - Deleting a single crawl
   - Bulk re-analyzing remaining crawls
   - Bulk deleting all crawls
   - User logout

2. **`auth.spec.ts`** - Authentication focused tests:

   - Successful user registration
   - Complete login and logout flow

3. **`crawl-control.spec.ts`** - Crawl management operations:
   - Adding single and multiple URLs
   - Viewing crawl details and navigation
   - Individual crawl deletion
   - Bulk operations (re-analyze and delete)

## Code Organization

### Page Objects

Each test file utilizes page object classes for better maintainability:

- **`AuthPage`**: Handles authentication flows (signup, login, logout)
- **`DashboardPage`**: Manages dashboard interactions and crawl operations

### Configuration

**Constants defined in each test file:**

- `TIMEOUTS`: Standardized wait times for different operations
- `SELECTORS`: Centralized CSS selectors for UI elements
- `URL_PATTERNS`: Regex patterns for URL validation
- `TestUser`: TypeScript interface for user data

### Key Features

- **Radix UI Compatible**: Proper selectors for Radix UI components (checkboxes, dropdowns)
- **Reliable Interactions**: Tested selectors that work with the actual UI
- **Error Prevention**: Type-safe interfaces and proper wait strategies
- **Maintainable**: Easy to update selectors and timeouts in one place

## Running Tests

### Run All Tests

```bash
pnpm test:e2e
```

### Run Specific Test Suite

```bash
# Run the main 9-scenario journey
pnpm test:e2e:main

# Run authentication tests only
pnpm test:e2e:auth

# Run crawl management tests only
pnpm test:e2e:crawls
```

### Run Tests with Visible Browser

```bash
pnpm test:e2e:headed
```

### Generate Test Report

```bash
pnpm test:e2e:report
```

## Test Configuration

- **Browser**: Chromium only (Chrome)
- **Focus**: Happy path scenarios with robust error handling
- **Data**: Randomly generated using faker.js for each test run
- **Environment**: Local development server on `http://localhost:3000`
- **Architecture**: Page Object Model with TypeScript
- **UI Components**: Radix UI compatible selectors

## Test Features

### Coverage Areas

- ✅ User authentication (register, login, logout)
- ✅ Crawl creation (single and bulk)
- ✅ Crawl management (view, delete, re-analyze)
- ✅ Dashboard navigation and interactions
- ✅ Complete user workflow (all 9 scenarios)
- ✅ Bulk operations (select all, re-run, delete)
- ✅ Form interactions and validations

### Technical Improvements

- ✅ Page Object Model implementation
- ✅ Centralized configuration constants
- ✅ TypeScript interfaces and type safety
- ✅ Proper async/await patterns
- ✅ Reliable element selectors
- ✅ Consistent timeout management
- ✅ Modular and reusable code

### What's NOT Included

- ❌ Error handling scenarios
- ❌ Edge cases and negative testing
- ❌ Multi-browser testing
- ❌ Accessibility testing
- ❌ Responsive design testing
- ❌ Performance testing

## Quick Start

1. Make sure your application is running:

   ```bash
   pnpm dev
   ```

2. Run the main test covering all 9 scenarios:

   ```bash
   pnpm test:e2e:main
   ```

3. View the test report:
   ```bash
   pnpm test:e2e:report
   ```

## Test Data

All tests use randomly generated test data via the `@faker-js/faker` library to ensure:

- **No conflicts** between test runs
- **Fresh data** for each test execution
- **Realistic test scenarios** with varied inputs
- **Isolation** between different test suites

## Code Examples

### Page Object Usage

```typescript
// Initialize page objects
const authPage = new AuthPage(page);
const dashboardPage = new DashboardPage(page);

// Use encapsulated methods
await authPage.signUp(testUser);
await authPage.login(testUser);
await dashboardPage.openCrawlSheet();
```

### Configuration Constants

```typescript
const SELECTORS = {
  CRAWL_BUTTON: 'button:has-text("Crawl URL(s)")',
  SELECT_ALL_CHECKBOX: 'th [role="checkbox"]:first-child',
  USER_DROPDOWN: "header button:has(canvas)",
} as const;
```

## Troubleshooting

### Common Issues

If tests fail, try these steps:

1. **Environment Check**: Ensure the application is running on `http://localhost:3000`
2. **Debug Mode**: Run tests with visible browser: `pnpm test:e2e:headed`
3. **Test Reports**: Check detailed results: `pnpm test:e2e:report`
4. **Selector Issues**: Verify UI components haven't changed structure
5. **Timing Issues**: Adjust timeout constants if needed

### Debugging Tips

- **Step-by-step execution**: Tests use `test.step()` for clear progress tracking
- **Console output**: Page object methods include helpful logging
- **Screenshots**: Playwright automatically captures screenshots on failure
- **Video recording**: Available for failed test runs

### Maintenance

When UI changes occur:

1. **Update selectors** in the `SELECTORS` constant
2. **Adjust timeouts** in the `TIMEOUTS` constant
3. **Modify page objects** if interaction patterns change
4. **Test locally** before committing changes

The page object pattern makes maintenance easier by centralizing UI interactions in reusable classes.
