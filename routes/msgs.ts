import Router, { RouterContext } from "koa-router";
import bodyParser from "koa-bodyparser";
import { jwtAuth } from "../controllers/authJWT";
import { getLatestMessageByBookingIdAndUserId } from "../models/msgs";

const router: Router = new Router({ prefix: "/api/v1/msgs" });

/**
 * Route: Get latest messages for multiple booking IDs
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
