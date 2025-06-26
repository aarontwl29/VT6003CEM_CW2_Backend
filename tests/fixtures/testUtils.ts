const jwt = require("jsonwebtoken");
import { testUsers } from "./testData";

// Mock JWT token generation for testing
export const generateTestToken = (
  user: any,
  expiresIn: string = "1h"
): string => {
  const payload = {
    id: user.id,
    role: user.role,
    username: user.username,
  };

  return jwt.sign(payload, "test-secret-key", { expiresIn });
};

// Mock database responses
export const mockDbResponse = {
  success: (data: any) => Promise.resolve(data),
  empty: () => Promise.resolve([]),
  error: (message: string) => Promise.reject(new Error(message)),
};

// Create test app instance
export const createTestApp = () => {
  const Koa = require("koa");
  const app = new Koa();

  // Add error handling middleware
  app.use(async (ctx: any, next: any) => {
    try {
      await next();
    } catch (err: any) {
      ctx.status = err.status || 500;
      ctx.body = { message: err.message };
    }
  });

  return app;
};

// File upload helper
export const createTestFile = (
  filename: string,
  content: string = "test content"
) => {
  const fs = require("fs");
  const path = require("path");

  const testFilePath = path.join(__dirname, filename);
  fs.writeFileSync(testFilePath, content);

  return testFilePath;
};

// Cleanup helper
export const cleanupTestFiles = (directory: string) => {
  const fs = require("fs");
  const path = require("path");

  if (fs.existsSync(directory)) {
    const files = fs.readdirSync(directory);
    files.forEach((file: string) => {
      if (file.includes("test-")) {
        fs.unlinkSync(path.join(directory, file));
      }
    });
  }
};
