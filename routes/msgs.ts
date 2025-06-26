/**
 * @fileoverview Booking messages routes
 * @description Handles retrieval of booking-related messages between users and staff
 * @author VT6003CEM Hotel Booking API
 * @version 1.0.0
 */

import Router, { RouterContext } from "koa-router";
import bodyParser from "koa-bodyparser";
import { jwtAuth } from "../controllers/authJWT";
import { getLatestMessageByBookingIdAndUserId } from "../models/msgs";

const router: Router = new Router({ prefix: "/api/v1/msgs" });

/**
 * Get latest messages for multiple booking IDs
 * @route POST /api/v1/msgs/bookings
 * @param {number[]} booking_ids - Array of booking IDs to get messages for
 * @returns {Object[]} Array of latest messages for each booking
 * @throws {400} Invalid or missing booking IDs
 * @throws {401} Unauthorized - Valid JWT token required
 * @throws {500} Failed to retrieve messages
 * @description Retrieves the latest message for each specified booking ID for the authenticated user
 * @security Bearer token required
 * @example
 * POST /api/v1/msgs/bookings
 * { "booking_ids": [1, 2, 3] }
 *
 * Response: [
 *   { "booking_id": 1, "message": "...", "sender_id": 123, "timestamp": "..." },
 *   { "booking_id": 2, "message": "...", "sender_id": 456, "timestamp": "..." }
 * ]
 */
const getLatestMessagesByBookingIds = async (ctx: RouterContext, next: any) => {
  const user_id = ctx.state.user?.id; // Extract user ID from JWT token
  const { booking_ids } = ctx.request.body as { booking_ids: number[] };

  if (!user_id || !Array.isArray(booking_ids) || booking_ids.length === 0) {
    ctx.status = 400;
    ctx.body = { message: "Invalid or missing booking IDs" };
    return;
  }

  try {
    const messages = await Promise.all(
      booking_ids.map(async (booking_id) => {
        const latestMessage = await getLatestMessageByBookingIdAndUserId(
          booking_id,
          user_id
        );
        return latestMessage;
      })
    );

    ctx.status = 200;
    ctx.body = messages.filter((message) => message !== null);
  } catch (error) {
    console.error("Error retrieving latest messages:", error);
    ctx.status = 500;
    ctx.body = {
      message: "Failed to retrieve messages",
      error: error instanceof Error ? error.message : String(error),
    };
  }

  await next();
};

// Add route to the router
router.post("/bookings", bodyParser(), jwtAuth, getLatestMessagesByBookingIds);

export { router };
