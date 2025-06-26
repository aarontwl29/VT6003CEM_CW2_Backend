/**
 * @fileoverview JWT Authentication controller
 * @description Handles JWT token generation, verification, and authentication middleware
 * @author VT6003CEM Hotel Booking API
 * @version 1.0.0
 */

import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { RouterContext } from "koa-router";

const secret: Secret = process.env.JWT_SECRET || "default_secret"; // Use .env for real secret key

/**
 * Generate JWT token with user data payload
 * @param {string|object|Buffer} payload - Data to encode in the token
 * @param {string|number} [expiresIn="1h"] - Token expiration time
 * @returns {string} Signed JWT token
 * @throws {Error} Token generation error
 * @description Creates a signed JWT token with the provided payload and expiration
 * @example
 * const token = generateToken({ id: 123, role: 'user' }, '24h');
 */
export const generateToken = (
  payload: string | object | Buffer,
  expiresIn: string | number = "1h"
) => {
  const options: SignOptions = {
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
  }; // expiresIn cast to correct type
  return jwt.sign(payload, secret, options);
};

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token to verify
 * @returns {object} Decoded token payload
 * @throws {Error} Token verification error (invalid, expired, etc.)
 * @description Verifies JWT token signature and returns decoded payload
 * @example
 * const decoded = verifyToken(token);
 * console.log(decoded.id, decoded.role);
 */
export const verifyToken = (token: string) => {
  return jwt.verify(token, secret);
};

/**
 * Middleware to protect APIs with JWT
 * @param {RouterContext} ctx - Koa router context
 * @param {function} next - Next middleware function
 * @returns {Promise<void>}
 * @throws {Error} If token is missing or invalid
 * @description Koa middleware that checks for a valid JWT in the Authorization header
 * and denies access if the token is missing or invalid.
 * @example
 * // In your Koa router
 * router.get('/protected', jwtAuth, (ctx) => {
 *   ctx.body = { message: 'This is a protected route' };
 * });
 */
export const jwtAuth = async (ctx: RouterContext, next: any) => {
  const authHeader = ctx.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    ctx.status = 401;
    ctx.body = { message: "Token required" };
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyToken(token);
    ctx.state.user = decoded; // Store decoded payload (id, role, etc.)
    await next();
  } catch (err) {
    ctx.status = 403;
    ctx.body = { message: "Invalid or expired token" };
  }
};
