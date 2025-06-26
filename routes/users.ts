/**
 * @fileoverview User management routes
 * @description Handles user authentication, registration, profile management, and user operations
 * @author VT6003CEM Hotel Booking API
 * @version 1.0.0
 */

import { generateToken, jwtAuth } from "../controllers/authJWT";
import { validateUser } from "../controllers/validation";
import Router, { RouterContext } from "koa-router";
import bodyParser from "koa-bodyparser";
import * as model from "../models/users";
import * as bookingRoutes from "./booking";
import bcrypt from "bcryptjs";

const prefix = "/api/v1/users";
const router: Router = new Router({ prefix: prefix });

/**
 * Get all users with pagination (Admin only)
 * @route GET /api/v1/users
 * @param {number} [limit=20] - Maximum number of users to return
 * @param {number} [page=1] - Page number for pagination
 * @returns {Object[]} Array of user objects
 * @throws {401} Unauthorized - Admin access required
 * @throws {404} No users found
 * @description Retrieves a paginated list of all users (admin access required)
 * @security Bearer token required
 * @example GET /api/v1/users?limit=20&page=1
 */
const getAll = async (ctx: any, next: any) => {
  let users = await model.getAll(20, 1);
  if (users.length) {
    ctx.body = users;
  } else {
    ctx.body = {};
  }
  await next();
};

/**
 * Search users by field and query (Admin only)
 * @route GET /api/v1/users/search
 * @param {number} [limit=50] - Maximum number of results
 * @param {number} [page=1] - Page number for pagination
 * @param {string} [fields] - Fields to search in
 * @param {string} [q] - Search query
 * @returns {Object[]} Array of matching user objects
 * @throws {401} Unauthorized - Admin access required
 * @throws {404} No users found
 * @description Searches for users based on field and query parameters (admin access required)
 * @security Bearer token required
 * @example GET /api/v1/users/search?fields=username&q=john&limit=10
 */
const doSearch = async (ctx: any, next: any) => {
  let { limit = 50, page = 1, fields = "", q = "" } = ctx.request.query;
  // ensure params are integers
  limit = parseInt(limit);
  page = parseInt(page);
  // validate values to ensure they are sensible
  limit = limit > 200 ? 200 : limit;
  limit = limit < 1 ? 10 : limit;
  page = page < 1 ? 1 : page;
  let result: any;
  // search by single field and field contents
  // need to validate q input
  if (ctx.state.user.user.role === "admin") {
    try {
      if (q !== "") result = await model.getSearch(fields, q);
      else {
        console.log("get all");
        result = await model.getAll(limit, page);
        console.log(result);
      }

      if (result.length) {
        if (fields !== "") {
          // first ensure the fields are contained in an array
          // need this since a single field in the query is passed as a string
          console.log("fields" + fields);
          if (!Array.isArray(fields)) {
            fields = [fields];
          }
          // then filter each row in the array of results
          // by only including the specified fields
          result = result.map((record: any) => {
            let partial: any = {};
            for (let field of fields) {
              partial[field] = record[field];
            }
            return partial;
          });
        }
        console.log(result);
        ctx.body = result;
      }
    } catch (error) {
      return error;
    }
    await next();
  } else {
    ctx.body = { msg: ` ${ctx.state.user.user.role} role is not authorized` };
    ctx.status = 401;
  }
};

// Own
export const createPublicUser = async (ctx: any) => {
  const body = ctx.request.body;

  const user = {
    firstname: body.firstname || "",
    lastname: body.lastname || "",
    username: body.username,
    about: body.about || "",
    email: body.email,
    password: body.password, // Plain for now, hash recommended
    avatarurl: body.avatarurl || "",
    role: "user",
  };

  try {
    await model.add(user);
    ctx.body = { message: "User registered successfully" };
  } catch (err) {
    ctx.status = 500;
    ctx.body = { message: "Registration failed", error: err };
  }
};

export const createStaffUser = async (ctx: any) => {
  const body = ctx.request.body;

  const signupCode = body.signupCode;
  if (!signupCode) {
    ctx.status = 400;
    ctx.body = { message: "Sign-up code is required for staff registration" };
    return;
  }

  const codeRecord = await model.checkSignupCode(signupCode);
  if (!codeRecord) {
    ctx.status = 403;
    ctx.body = { message: "Invalid or already used sign-up code" };
    return;
  }

  const user = {
    firstname: body.firstname || "",
    lastname: body.lastname || "",
    username: body.username,
    about: body.about || "",
    email: body.email,
    password: body.password,
    avatarurl: body.avatarurl || "",
    role:
      (codeRecord as { generated_for?: string }).generated_for || "operator",
  };

  try {
    await model.add(user);
    await model.markCodeAsUsed(signupCode);
    ctx.body = { message: "Staff account registered successfully" };
  } catch (err) {
    ctx.status = 500;
    ctx.body = { message: "Registration failed", error: err };
  }
};

export const login = async (ctx: RouterContext) => {
  const body = ctx.request.body as { username: string; password: string };
  const { username, password } = body;

  try {
    // Fetch user by username from the database
    const user = (await model.findByUsername(username)) as {
      id: number;
      firstname: string;
      lastname: string;
      username: string;
      about: string;
      email: string;
      password: string;
      avatarurl: string;
      role: string;
    }[];

    // Check if user exists
    if (!user.length) {
      ctx.status = 401;
      ctx.body = { message: "Invalid credentials" };
      return;
    }

    // Validate password directly (no hashing)
    if (user[0].password !== password) {
      ctx.status = 401;
      ctx.body = { message: "Invalid credentials" };
      return;
    }

    // Generate JWT payload
    const payload = {
      id: user[0].id,
      role: user[0].role,
      username: user[0].username,
    };

    // Generate token using authJWT
    const token = generateToken(payload);

    // Respond with the token and user details (excluding password)
    ctx.status = 200;
    ctx.body = {
      message: "Login successful",
      token,
      user: {
        id: user[0].id,
        firstname: user[0].firstname,
        lastname: user[0].lastname,
        username: user[0].username,
        about: user[0].about,
        email: user[0].email,
        avatarurl: user[0].avatarurl,
        role: user[0].role,
      },
    };
  } catch (error) {
    // Handle unexpected errors
    const err = error as Error; // Explicitly cast `error` to `Error`
    ctx.status = 500;
    ctx.body = { message: "Internal server error", error: err.message };
  }
};

export const getRole = async (ctx: RouterContext) => {
  const user = ctx.state.user;

  if (!user || !user.id) {
    ctx.status = 400;
    ctx.body = { message: "Invalid token or user ID not found in token" };
    return;
  }

  try {
    const role = await model.findRoleById(user.id);

    if (role) {
      ctx.status = 200;
      ctx.body = { role };
    } else {
      ctx.status = 404;
      ctx.body = { message: "User not found or role not assigned" };
    }
  } catch (error) {
    const err = error as Error;
    ctx.status = 500;
    ctx.body = { message: "Internal server error", error: err.message };
  }
};

/**
 * Route: Get user profile (for the logged-in user)
 */
const getUserInfo = async (ctx: RouterContext, next: any) => {
  const userId = ctx.state.user?.id; // Extract user ID from JWT token

  if (!userId) {
    ctx.status = 400;
    ctx.body = { message: "User ID not found in token" };
    return;
  }

  try {
    const user = await model.getByUserId(userId);

    if (user) {
      ctx.status = 200;
      ctx.body = user;
    } else {
      ctx.status = 404;
      ctx.body = { message: "User not found" };
    }
  } catch (error) {
    const err = error as Error;
    ctx.status = 500;
    ctx.body = { message: "Internal server error", error: err.message };
  }

  await next();
};

/**
 * Route: Get all users (for admin)
 */
const getUsersInfo = async (ctx: RouterContext, next: any) => {
  const userRole = ctx.state.user?.role; // Extract user role from JWT token

  if (userRole !== "admin") {
    ctx.status = 403;
    ctx.body = { message: "Access denied. Admin role required." };
    return;
  }

  try {
    const { limit = 10, page = 1 } = ctx.request.query;
    const users = await model.getAll(
      parseInt(limit as string),
      parseInt(page as string)
    );

    if (users.length) {
      ctx.status = 200;
      ctx.body = users;
    } else {
      ctx.status = 404;
      ctx.body = { message: "No users found" };
    }
  } catch (error) {
    const err = error as Error;
    ctx.status = 500;
    ctx.body = { message: "Internal server error", error: err.message };
  }

  await next();
};

/**
 * Route: Change password
 */
const changePassword = async (ctx: RouterContext, next: any) => {
  const userId = ctx.state.user?.id; // Extract user ID from JWT token
  const { oldPassword, newPassword } = ctx.request.body as {
    oldPassword: string;
    newPassword: string;
  };

  if (!userId) {
    ctx.status = 400;
    ctx.body = { message: "User ID not found in token" };
    return;
  }

  if (!oldPassword || !newPassword) {
    ctx.status = 400;
    ctx.body = { message: "Both old and new passwords are required" };
    return;
  }

  try {
    // Fetch user by ID
    const user = await model.getByUserId(userId);

    if (!user) {
      ctx.status = 404;
      ctx.body = { message: "User not found" };
      return;
    }

    // Validate old password directly
    if (user.password !== oldPassword) {
      ctx.status = 401;
      ctx.body = { message: "Old password is incorrect" };
      return;
    }

    // Update password in the database
    await model.update({ password: newPassword }, userId);

    ctx.status = 200;
    ctx.body = { message: "Password updated successfully" };
  } catch (error) {
    const err = error as Error;
    ctx.status = 500;
    ctx.body = { message: "Internal server error", error: err.message };
  }

  await next();
};

/**
 * Route: Update user profile information
 */
const updateUserInfo = async (ctx: RouterContext, next: any) => {
  const userId = ctx.state.user?.id; // Extract user ID from JWT token
  const userRole = ctx.state.user?.role; // Extract user role from JWT token
  const targetUserId = ctx.params.id ? parseInt(ctx.params.id) : userId; // Target user ID (from params or current user)

  const {
    firstname,
    lastname,
    about,
    avatarurl,
    oldPassword,
    newPassword,
    role, // Only admin can update roles
  } = ctx.request.body as {
    firstname?: string;
    lastname?: string;
    about?: string;
    avatarurl?: string;
    oldPassword?: string;
    newPassword?: string;
    role?: string;
  };

  if (!userId) {
    ctx.status = 400;
    ctx.body = { message: "User ID not found in token" };
    return;
  }

  // Role-based access control
  const canUpdateOtherUsers = userRole === "admin";
  const isUpdatingSelf = userId === targetUserId;

  if (!canUpdateOtherUsers && !isUpdatingSelf) {
    ctx.status = 403;
    ctx.body = {
      message:
        "Access denied. You can only update your own profile or need admin privileges.",
    };
    return;
  }

  try {
    // Fetch the target user to verify existence and get current data
    const targetUser = await model.getByUserId(targetUserId);
    if (!targetUser) {
      ctx.status = 404;
      ctx.body = { message: "User not found" };
      return;
    }

    // Build update object with allowed fields only
    const updateData: any = {};

    // Fields that can be updated by the user themselves or admin
    if (firstname !== undefined) updateData.firstname = firstname;
    if (lastname !== undefined) updateData.lastname = lastname;
    if (about !== undefined) updateData.about = about;
    if (avatarurl !== undefined) updateData.avatarurl = avatarurl;

    // Role update - only admin can update roles
    if (role !== undefined) {
      if (userRole !== "admin") {
        ctx.status = 403;
        ctx.body = { message: "Only administrators can update user roles" };
        return;
      }

      // Validate role value
      const validRoles = ["admin", "operator", "user"];
      if (!validRoles.includes(role)) {
        ctx.status = 400;
        ctx.body = {
          message: "Invalid role. Must be one of: admin, operator, user",
        };
        return;
      }

      updateData.role = role;
    }

    // Password change logic
    if (newPassword !== undefined) {
      if (!oldPassword) {
        ctx.status = 400;
        ctx.body = {
          message: "Old password is required when changing password",
        };
        return;
      }

      // For admin updating other users, they don't need to provide old password
      if (isUpdatingSelf) {
        // Validate old password for self-update
        if (targetUser.password !== oldPassword) {
          ctx.status = 401;
          ctx.body = { message: "Old password is incorrect" };
          return;
        }
      } else if (userRole !== "admin") {
        ctx.status = 403;
        ctx.body = {
          message: "Only the user themselves or admin can change passwords",
        };
        return;
      }

      // Validate new password strength (optional)
      if (newPassword.length < 6) {
        ctx.status = 400;
        ctx.body = {
          message: "New password must be at least 6 characters long",
        };
        return;
      }

      updateData.password = newPassword;
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      ctx.status = 400;
      ctx.body = { message: "No valid fields provided for update" };
      return;
    }

    // Perform the update
    const updatedUser: any = await model.update(updateData, targetUserId);

    if (updatedUser) {
      // Remove password from response
      const { password, ...userResponse } = updatedUser;

      ctx.status = 200;
      ctx.body = {
        message: "User information updated successfully",
        user: userResponse,
      };
    } else {
      ctx.status = 500;
      ctx.body = { message: "Failed to update user information" };
    }
  } catch (error) {
    const err = error as Error;
    ctx.status = 500;
    ctx.body = { message: "Internal server error", error: err.message };
  }

  await next();
};

/**
 * Route: Update current user's profile (simplified version)
 */
const updateMyProfile = async (ctx: RouterContext, next: any) => {
  // Set the target user ID to the current user's ID
  ctx.params.id = ctx.state.user?.id?.toString();
  return updateUserInfo(ctx, next);
};

router.post("/login", bodyParser(), login);
router.post("/public/register", bodyParser(), validateUser, createPublicUser);
router.post("/staff/register", bodyParser(), validateUser, createStaffUser);
router.get("/public/role", jwtAuth, getRole);
router.get(
  "/booking/:id([0-9]{1,})",
  jwtAuth,
  bookingRoutes.getUserInfoById_BookingList
);
router.get("/profile", jwtAuth, getUserInfo);
router.get("/list", jwtAuth, getUsersInfo);

router.put("/profile", jwtAuth, bodyParser(), updateMyProfile);
router.put("/profile/:id([0-9]+)", jwtAuth, bodyParser(), updateUserInfo);

export { router };
