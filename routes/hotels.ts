import Router, { RouterContext } from "koa-router";
import bodyParser from "koa-bodyparser";
import * as model from "../models/hotels";
import { jwtAuth } from "../controllers/authJWT";

const router: Router = new Router({ prefix: "/api/v1/hotels" });

const getAll = async (ctx: RouterContext, next: any) => {
  const {
    limit = 100,
    page = 1,
    order = "rating",
    direction = "DESC",
  } = ctx.request.query;
  const parsedLimit = parseInt(limit as string, 10);
  const parsedPage = parseInt(page as string, 10);

  try {
    const result = await model.getAll(parsedLimit, parsedPage);
    if (result.length) {
      ctx.body = result.map((hotel: any) => {
        const {
          id,
          name,
          description,
          city,
          country,
          address,
          rating,
          review_count,
          image_url,
        } = hotel;

        return {
          id,
          name,
          description,
          city,
          country,
          address,
          rating,
          review_count,
          image_url,
          links: {
            self: `http://${ctx.host}/api/v1/hotels/${id}`,
          },
        };
      });
      ctx.status = 200;
    } else {
      ctx.body = { message: "No hotels found" };
      ctx.status = 404;
    }
  } catch (error) {
    ctx.body = { error: "Failed to fetch hotels" };
    ctx.status = 500;
  }

  await next();
};

const searchHotels = async (ctx: RouterContext, next: any) => {
  const { country, city, start_date, end_date } = ctx.request.body as {
    country?: string;
    city?: string;
    start_date?: string;
    end_date?: string;
  }; // Parse JSON body

  try {
    // Step 1: Search for hotels based on filters
    const filters = {
      country: country as string,
      city: city as string,
      start_date: start_date as string,
      end_date: end_date as string,
    };

    const hotels = await model.getHotels(filters);

    if (Array.isArray(hotels) && hotels.length) {
      // Step 2: Find the cheapest room for each hotel
      const results = await Promise.all(
        hotels.map(async (hotel: any) => {
          const cheapestRoom = await model.getCheapestRoom(hotel.id);
          return {
            ...hotel,
            cheapest_room: cheapestRoom, // Include cheapest room details
          };
        })
      );

      ctx.body = results;
      ctx.status = 200;
    } else {
      ctx.body = { message: "No hotels found matching the criteria" };
      ctx.status = 404;
    }
  } catch (error) {
    ctx.body = { error: "Failed to search hotels" };
    ctx.status = 500;
  }

  await next();
};

const getHotelById = async (ctx: RouterContext, next: any) => {
  const hotel_id = parseInt(ctx.params.id);

  if (isNaN(hotel_id)) {
    ctx.status = 400;
    ctx.body = { error: "Invalid hotel ID" };
    return await next();
  }

  try {
    const hotel = await model.getHotelById(hotel_id);

    if (hotel) {
      ctx.body = {
        ...hotel,
        links: {
          self: `http://${ctx.host}/api/v1/hotels/${hotel_id}`,
        },
      };
      ctx.status = 200;
    } else {
      ctx.status = 404;
      ctx.body = { message: "Hotel not found" };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: "Failed to fetch hotel" };
  }

  await next();
};

const getRoomsByHotelId = async (ctx: RouterContext, next: any) => {
  const hotel_id = parseInt(ctx.params.id);

  if (isNaN(hotel_id)) {
    ctx.status = 400;
    ctx.body = { error: "Invalid hotel ID" };
    return await next();
  }

  try {
    const rooms = await model.getRoomsByHotelId(hotel_id);

    if (Array.isArray(rooms) && rooms.length) {
      ctx.body = rooms.map((room: any) => {
        return {
          ...room,
          links: {
            hotel: `http://${ctx.host}/api/v1/hotels/${hotel_id}`,
            self: `http://${ctx.host}/api/v1/hotels/${hotel_id}/rooms/${room.id}`,
          },
        };
      });
      ctx.status = 200;
    } else {
      ctx.status = 404;
      ctx.body = { message: "No rooms found for this hotel" };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: "Failed to fetch rooms" };
  }

  await next();
};

const createBooking = async (ctx: RouterContext, next: any) => {
  const { start_date, end_date, staff_email, first_message, room_ids } = ctx
    .request.body as {
    start_date: string;
    end_date: string;
    staff_email?: string; // Optional agency email
    first_message: string;
    room_ids: number[];
  };

  const user_id = ctx.state.user?.id;

  console.log("Request body:", ctx.request.body); // Log the request body
  console.log("User ID from JWT:", user_id); // Log the user ID

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
    const booking_id = await model.createBooking(
      user_id,
      start_date,
      end_date,
      staff_email || null, // Use staff_email as provided
      first_message
    );

    console.log("Booking ID:", booking_id); // Log the booking ID

    if (!booking_id) {
      ctx.status = 500;
      ctx.body = { message: "Failed to create booking" };
      return;
    }

    await model.addRoomsToBooking(booking_id, room_ids);

    ctx.status = 201;
    ctx.body = { message: "Booking created successfully", booking_id };
  } catch (error) {
    console.error("Error in createBooking route:", error); // Log the error
    ctx.status = 500;
    ctx.body = {
      message: "Failed to create booking",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  await next();
};

router.get("/", getAll);
router.post("/search", bodyParser(), searchHotels);
router.get("/:id", getHotelById);
router.get("/:id/rooms", getRoomsByHotelId);
router.post("/bookings", bodyParser(), jwtAuth, createBooking);

export { router };
