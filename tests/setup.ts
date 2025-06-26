// Test setup file
// Note: dotenv is optional for tests, using process.env directly
// If you need dotenv, install it: npm install dotenv

// Load test environment variables (if dotenv is installed)
// dotenv.config({ path: '.env.test' });

// Set test environment variables directly
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-key";

// Global test configuration
global.console = {
  ...console,
  log: jest.fn(), // Mock console.log in tests
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set test timeout
jest.setTimeout(10000);

// Global test hooks
beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Cleanup after each test
  jest.restoreAllMocks();
});
