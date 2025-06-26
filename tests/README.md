# Testing Guide for Hotel Booking API

## Overview

This testing suite covers unit tests, integration tests, and API endpoint tests for the hotel booking backend system.

## Setup

### Install Dependencies

```bash
# Run the installation script
chmod +x install-test-deps.sh
./install-test-deps.sh

# Or install manually
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
```

### Configuration

- Jest configuration: `jest.config.json`
- Test environment: `.env.test`
- Test setup: `tests/setup.ts`

## Running Tests

### All Tests

```bash
npm test
```

### Watch Mode (Development)

```bash
npm run test:watch
```

### Coverage Report

```bash
npm run test:coverage
```

### Unit Tests Only

```bash
npm run test:unit
```

### Integration Tests Only

```bash
npm run test:integration
```

## Test Structure

### Unit Tests (`tests/unit/`)

- Test individual functions and methods
- Mock external dependencies
- Fast execution
- Examples: Model functions, utility functions

### Integration Tests (`tests/integration/`)

- Test API endpoints
- Test route handlers
- Test middleware integration
- Examples: Login, file upload, CRUD operations

### Test Fixtures (`tests/fixtures/`)

- Sample data for tests
- Test utilities and helpers
- Mock responses

## Writing Tests

### Unit Test Example

```typescript
describe("User Model", () => {
  it("should return user by ID", async () => {
    // Arrange
    const mockUser = { id: 1, name: "John" };
    mockDb.run_query.mockResolvedValue([mockUser]);

    // Act
    const result = await getByUserId(1);

    // Assert
    expect(result).toEqual(mockUser);
  });
});
```

### Integration Test Example

```typescript
describe("POST /api/v1/users/login", () => {
  it("should login successfully", async () => {
    const response = await request(app.callback())
      .post("/api/v1/users/login")
      .send({ username: "test", password: "pass" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });
});
```

## Test Coverage

### Targets

- Controllers: > 80%
- Models: > 90%
- Routes: > 85%
- Overall: > 85%

### Coverage Report

After running `npm run test:coverage`, view the report at `coverage/lcov-report/index.html`

## Best Practices

1. **Test Structure**: Use AAA pattern (Arrange, Act, Assert)
2. **Mocking**: Mock external dependencies (database, APIs)
3. **Isolation**: Each test should be independent
4. **Descriptive Names**: Use clear, descriptive test names
5. **Edge Cases**: Test both success and failure scenarios
6. **Cleanup**: Clean up resources after tests

## Common Test Scenarios

### Authentication Tests

- Valid login
- Invalid credentials
- Missing fields
- Token validation
- Role-based access

### CRUD Operations

- Create with valid data
- Create with invalid data
- Read existing records
- Read non-existent records
- Update operations
- Delete operations

### File Upload Tests

- Valid file upload
- Invalid file types
- File size limits
- Missing files
- Authentication required

### Error Handling

- Database errors
- Validation errors
- Network errors
- Permission errors

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure all dependencies are installed
2. **Path Issues**: Use absolute paths in test files
3. **Async Tests**: Use async/await properly
4. **Mock Issues**: Clear mocks between tests

### Debug Tests

```bash
# Run specific test file
npx jest tests/unit/users.model.test.ts

# Debug mode
npx jest --debug tests/unit/users.model.test.ts

# Verbose output
npx jest --verbose
```

## Continuous Integration

For CI/CD pipelines, use:

```bash
npm run test:ci
```

This command runs tests without watch mode and generates coverage reports suitable for CI environments.
