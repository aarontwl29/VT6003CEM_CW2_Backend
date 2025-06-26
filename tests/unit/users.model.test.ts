import { getByUserId, update, findByUsername } from "../../models/users";
import * as db from "../../helpers/database";

// Mock the database module
jest.mock("../../helpers/database");
const mockDb = db as jest.Mocked<typeof db>;

describe("User Model Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getByUserId", () => {
    it("should return user when user exists", async () => {
      // Arrange
      const mockUser = {
        id: 1,
        firstname: "John",
        lastname: "Doe",
        username: "johndoe",
        email: "john@example.com",
        role: "user",
        avatarurl: null,
        about: null,
      };
      mockDb.run_query.mockResolvedValue([mockUser]);

      // Act
      const result = await getByUserId(1);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockDb.run_query).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE id = ?;",
        [1]
      );
    });

    it("should return null when user does not exist", async () => {
      // Arrange
      mockDb.run_query.mockResolvedValue([]);

      // Act
      const result = await getByUserId(999);

      // Assert
      expect(result).toBeNull();
      expect(mockDb.run_query).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE id = ?;",
        [999]
      );
    });

    it("should throw error when database fails", async () => {
      // Arrange
      const dbError = new Error("Database connection failed");
      mockDb.run_query.mockRejectedValue(dbError);

      // Act & Assert
      await expect(getByUserId(1)).rejects.toThrow(
        "Database connection failed"
      );
    });
  });

  describe("update", () => {
    it("should update user successfully", async () => {
      // Arrange
      const updateData = { firstname: "Jane", lastname: "Smith" };
      const updatedUser = { id: 1, firstname: "Jane", lastname: "Smith" };
      mockDb.run_query.mockResolvedValue([updatedUser]);

      // Act
      const result = await update(updateData, 1);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(mockDb.run_query).toHaveBeenCalledWith(
        "UPDATE users SET firstname = ?, lastname = ? WHERE id = ? RETURNING *;",
        ["Jane", "Smith", 1]
      );
    });

    it("should return null when user not found", async () => {
      // Arrange
      mockDb.run_query.mockResolvedValue([]);

      // Act
      const result = await update({ firstname: "Jane" }, 999);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("findByUsername", () => {
    it("should return user when username exists", async () => {
      // Arrange
      const mockUser = {
        id: 1,
        username: "johndoe",
        password: "password123",
      };
      mockDb.run_query.mockResolvedValue([mockUser]);

      // Act
      const result = await findByUsername("johndoe");

      // Assert
      expect(result).toEqual([mockUser]);
      expect(mockDb.run_query).toHaveBeenCalledWith(
        "SELECT * FROM users where username = ?",
        ["johndoe"]
      );
    });
  });
});
