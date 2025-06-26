import request from "supertest";
import Koa from "koa";
import { router as userRouter } from "../../routes/users";
import * as db from "../../helpers/database";

// Mock the database
jest.mock("../../helpers/database");
const mockDb = db as jest.Mocked<typeof db>;

describe("User Routes Integration Tests", () => {
  let app: Koa;

  beforeEach(() => {
    app = new Koa();
    app.use(userRouter.routes());
    app.use(userRouter.allowedMethods());
    jest.clearAllMocks();
  });

  describe("POST /api/v1/users/login", () => {
    it("should login successfully with valid credentials", async () => {
      // Arrange
      const mockUser = {
        id: 1,
        username: "testuser",
        password: "password123",
        role: "user",
        firstname: "Test",
        lastname: "User",
        email: "test@example.com",
      };
      mockDb.run_query.mockResolvedValue([mockUser]);

      // Act
      const response = await request(app.callback())
        .post("/api/v1/users/login")
        .send({
          username: "testuser",
          password: "password123",
        });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user.username).toBe("testuser");
      expect(response.body.user).not.toHaveProperty("password");
    });

    it("should fail login with invalid credentials", async () => {
      // Arrange
      mockDb.run_query.mockResolvedValue([]);

      // Act
      const response = await request(app.callback())
        .post("/api/v1/users/login")
        .send({
          username: "wronguser",
          password: "wrongpass",
        });

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid credentials");
    });

    it("should fail login with missing fields", async () => {
      // Act
      const response = await request(app.callback())
        .post("/api/v1/users/login")
        .send({
          username: "testuser",
          // missing password
        });

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid credentials");
    });
  });

  describe("GET /api/v1/users/profile", () => {
    it("should get user profile with valid token", async () => {
      // This test would require mocking JWT middleware
      // Implementation depends on your JWT setup
    });

    it("should reject access without token", async () => {
      // Act
      const response = await request(app.callback()).get(
        "/api/v1/users/profile"
      );

      // Assert
      expect(response.status).toBe(401);
    });
  });
});
