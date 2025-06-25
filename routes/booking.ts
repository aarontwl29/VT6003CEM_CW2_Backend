import { RouterContext } from "koa-router";
import * as modelBooking from "../models/booking";
import * as modelUsers from "../models/users";

// const router: Router = new Router({ prefix: "/api/v1/bookings" });

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
    const userData = (await modelUsers.getByUserId(user.id)) as UserData | null;
    if (!userData || !userData.role) {
      ctx.status = 404;
      ctx.body = { message: "User role not found" };
      return;
    }

    const userRole = userData.role;
    const userEmail = userData.email;

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

export const getUserInfoById_BookingList = async (ctx: RouterContext) => {
  try {
    // Extract user ID from URL parameters
    const user_id = parseInt(ctx.params.id, 10);
    if (isNaN(user_id) || user_id <= 0) {
      ctx.status = 400;
      ctx.body = { message: "Invalid or missing user ID" };
      return;
    }

    // Check user role from JWT token
    const userRole = ctx.state.user?.role;
    if (userRole !== "admin" && userRole !== "operator") {
      ctx.status = 403;
      ctx.body = { message: "Access denied: User is not an admin or operator" };
      return;
    }

    // Fetch user data using the model function
    const userData = await modelUsers.getByUserId(user_id);
    if (!userData) {
      ctx.status = 404;
      ctx.body = { message: `User with ID ${user_id} not found` };
      return;
    }

    // Respond with specific fields for security
    ctx.status = 200;
    ctx.body = {
      username: userData.username,
      firstname: userData.firstname,
      lastname: userData.lastname,
      email: userData.email,
      avatarurl: userData.avatarurl,
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      message: "Failed to fetch user info",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Route: Update booking
export const updateBookingRoute = async (ctx: RouterContext, next: any) => {
  const staff_id = ctx.state.user?.id; // Extract staff ID from JWT token
  const {
    booking_id,
    start_date,
    end_date,
    room_updates,
    recipient_id,
    message,
  } = ctx.request.body as {
    booking_id: number;
    start_date: string;
    end_date: string;
    room_updates: {
      room_id: number;
      status: "pending" | "approved" | "cancelled";
    }[];
    recipient_id: number; // User ID
    message: string;
  };

  if (
    !staff_id ||
    !booking_id ||
    !start_date ||
    !end_date ||
    !room_updates ||
    !recipient_id ||
    !message
  ) {
    ctx.status = 400;
    ctx.body = { message: "Missing required fields" };
    return;
  }

  try {
    const result = await modelBooking.updateBooking(
      booking_id,
      start_date,
      end_date,
      room_updates.map((room) => ({ ...room, staff_id })), // Add staff_id to each room update
      staff_id,
      recipient_id,
      message
    );

    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      message: "Failed to update booking",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  await next();
};
