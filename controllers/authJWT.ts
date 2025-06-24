import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { RouterContext } from "koa-router";

const secret: Secret = process.env.JWT_SECRET || "default_secret"; // Use .env for real secret key

// Issue a token with user data payload
export const generateToken = (
  payload: string | object | Buffer,
  expiresIn: string | number = "1h"
) => {
  const options: SignOptions = {
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
  }; // expiresIn cast to correct type
  return jwt.sign(payload, secret, options);
};

// Decode and verify token from header
export const verifyToken = (token: string) => {
  return jwt.verify(token, secret);
};

// Middleware to protect APIs with JWT
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
