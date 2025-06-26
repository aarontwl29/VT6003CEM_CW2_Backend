import request from "supertest";
import Koa from "koa";
import path from "path";
import fs from "fs";
import { router as uploadRouter } from "../../routes/userUploads";

describe("Image Upload Integration Tests", () => {
  let app: Koa;
  const testImagePath = path.join(__dirname, "../fixtures/test-image.jpg");

  beforeEach(() => {
    app = new Koa();
    app.use(uploadRouter.routes());
    app.use(uploadRouter.allowedMethods());
  });

  afterEach(() => {
    // Cleanup uploaded test files
    const uploadsDir = path.join(__dirname, "../../public/images");
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      files.forEach((file) => {
        if (file.includes("test-")) {
          fs.unlinkSync(path.join(uploadsDir, file));
        }
      });
    }
  });

  describe("POST /api/v1/users/upload-avatar", () => {
    it("should upload image successfully with valid token", async () => {
      // This test requires a valid JWT token
      const mockToken = "valid-jwt-token";

      const response = await request(app.callback())
        .post("/api/v1/users/upload-avatar")
        .set("Authorization", `Bearer ${mockToken}`)
        .attach("upload", testImagePath);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("avatarUrl");
      expect(response.body.message).toBe("Avatar uploaded successfully");
    });

    it("should reject upload without token", async () => {
      const response = await request(app.callback())
        .post("/api/v1/users/upload-avatar")
        .attach("upload", testImagePath);

      expect(response.status).toBe(401);
    });

    it("should reject upload without file", async () => {
      const mockToken = "valid-jwt-token";

      const response = await request(app.callback())
        .post("/api/v1/users/upload-avatar")
        .set("Authorization", `Bearer ${mockToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("No file uploaded");
    });

    it("should reject non-image files", async () => {
      const mockToken = "valid-jwt-token";
      const textFilePath = path.join(__dirname, "../fixtures/test-file.txt");

      const response = await request(app.callback())
        .post("/api/v1/users/upload-avatar")
        .set("Authorization", `Bearer ${mockToken}`)
        .attach("upload", textFilePath);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Only image files are allowed");
    });
  });
});
