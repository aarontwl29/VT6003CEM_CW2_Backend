import Router, { RouterContext } from "koa-router";
import bodyParser from "koa-bodyparser";
import { jwtAuth } from "../controllers/authJWT";
import * as modelHotels from "../models/hotels";
import * as modelBooking from "../models/booking";
import * as modelUsers from "../models/users";
import * as bookingRoutes from "./booking"; // Import booking logic

const router: Router = new Router({ prefix: "/api/v1/hotels" });

// Route: Get all hotels
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
    const result = await modelHotels.getAll(parsedLimit, parsedPage);
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

// Route: Search hotels
const searchHotels = async (ctx: RouterContext, next: any) => {
  const { country, city, start_date, end_date } = ctx.request.body as {
    country?: string;
    city?: string;
    start_date?: string;
    end_date?: string;
  };

  try {
    const filters = { country, city, start_date, end_date };
    const hotels = await modelHotels.getHotels(filters);

    if (Array.isArray(hotels) && hotels.length) {
      // Step 2: Find the cheapest room for each hotel
      const results = await Promise.all(
        hotels.map(async (hotel: any) => {
          const cheapestRoom = await modelHotels.getCheapestRoom(hotel.id);
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

// Route: Get hotel by ID
const getHotelById = async (ctx: RouterContext, next: any) => {
  const hotel_id = parseInt(ctx.params.id);

  if (isNaN(hotel_id)) {
    ctx.status = 400;
    ctx.body = { error: "Invalid hotel ID" };
    return await next();
  }

  try {
    const hotel = await modelHotels.getHotelById(hotel_id);

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

// Route: Get rooms by hotel ID
const getRoomsByHotelId = async (ctx: RouterContext, next: any) => {
  const hotel_id = parseInt(ctx.params.id);

  if (isNaN(hotel_id)) {
    ctx.status = 400;
    ctx.body = { error: "Invalid hotel ID" };
    return await next();
  }

  try {
    const rooms = await modelHotels.getRoomsByHotelId(hotel_id);

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

// Add routes to the router
router.get("/", getAll);
router.post("/search", bodyParser(), searchHotels);
router.get("/:id", getHotelById);
router.get("/:id/rooms", getRoomsByHotelId);
router.post(
  "/bookings",
  bodyParser(),
  jwtAuth,
  bookingRoutes.createBookingLogic
);
router.get("/private/bookings", jwtAuth, bookingRoutes.getBookingsByRoleLogic);

export { router };
