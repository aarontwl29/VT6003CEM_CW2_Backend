import Router, { RouterContext } from "koa-router";
import * as modelBooking from "../models/booking";
import * as modelUsers from "../models/users";

const router: Router = new Router({ prefix: "/api/v1/bookings" });

// Logic: Create a booking
export const createBookingLogic = async (ctx: RouterContext, next: any) => {
  const { start_date, end_date, staff_email, first_message, room_ids } = ctx
    .request.body as {
    start_date: string;
    end_date: string;
    staff_email?: string;
    first_message: string;
    room_ids: number[];
  };

  const user_id = ctx.state.user?.id;

  if (
    !user_id ||
    !start_date ||
    !end_date ||
    !first_message ||
    !room_ids ||
    !room_ids.length
  ) {
    ctx.status = 400;
    ctx.body = { message: "Missing required fields" };
    return;
  }

  try {
    const booking_id = await modelBooking.createBooking(
      user_id,
      start_date,
      end_date,
      staff_email || null,
      first_message
    );

    if (!booking_id) {
      ctx.status = 500;
      ctx.body = { message: "Failed to create booking" };
      return;
    }

    await modelBooking.addRoomsToBooking(booking_id, room_ids);

    ctx.status = 201;
    ctx.body = { message: "Booking created successfully", booking_id };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      message: "Failed to create booking",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  await next();
};

// Logic: Get bookings by role
export const getBookingsByRoleLogic = async (ctx: RouterContext) => {
  const user = ctx.state.user;

  if (!user || !user.id) {
    ctx.status = 400;
    ctx.body = { message: "Invalid token or user ID not found in token" };
    return;
  }

  try {
    type UserData = { role: string; email: string };
    const userData = (await modelUsers.getByUserId(user.id)) as UserData[];
    if (!userData || !userData[0]?.role) {
      ctx.status = 404;
      ctx.body = { message: "User role not found" };
      return;
    }

    const userRole = userData[0].role;
    const userEmail = userData[0].email;

    let bookings;

    if (userRole === "admin" || userRole === "operator") {
      bookings = await modelBooking.getBookingsForStaff(userEmail);
    } else if (userRole === "user") {
      bookings = await modelBooking.getBookingsByUserId(user.id);
    } else {
      ctx.status = 403;
      ctx.body = { message: "Unauthorized role" };
      return;
    }

    if (bookings.length) {
      const bookingsWithRooms = await Promise.all(
        bookings.map(async (booking: any) => {
          const rooms = await modelBooking.getBookingRoomsByBookingId(
            booking.booking_id
          );
          return {
            ...booking,
            rooms,
          };
        })
      );

      ctx.status = 200;
      ctx.body = bookingsWithRooms;
    } else {
      ctx.status = 404;
      ctx.body = { message: "No bookings found" };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      message: "Failed to load bookings",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Export the router
export { router };
