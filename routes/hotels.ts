/**
 * @fileoverview Hotel management routes
 * @description Handles hotel listings, search, room details, and booking operations
 * @author VT6003CEM Hotel Booking API
 * @version 1.0.0
 */

import Router, { RouterContext } from "koa-router";
import bodyParser from "koa-bodyparser";
import { jwtAuth } from "../controllers/authJWT";
import * as modelHotels from "../models/hotels";
import * as bookingRoutes from "./booking";
import { validateSearchHotels } from "../controllers/validation";
import { validateCreateBooking } from "../controllers/validation";
import { validateUpdateBooking } from "../controllers/validation";

const router: Router = new Router({ prefix: "/api/v1/hotels" });

/**
 * Get all hotels with pagination and sorting
 * @route GET /api/v1/hotels
 * @param {number} [limit=100] - Maximum number of hotels to return
 * @param {number} [page=1] - Page number for pagination
 * @param {string} [order=rating] - Field to sort by
 * @param {string} [direction=DESC] - Sort direction (ASC/DESC)
 * @returns {Object[]} Array of hotel objects with pagination
 * @throws {404} No hotels found
 * @throws {500} Failed to fetch hotels
 * @description Retrieves a paginated list of all hotels with basic information
 * @example
 * GET /api/v1/hotels?limit=10&page=1&order=rating&direction=DESC
 */
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

/**
 * Search for hotels based on criteria
 * @route POST /api/v1/hotels/search
 * @param {string} [country] - Country to filter hotels
 * @param {string} [city] - City to filter hotels
 * @param {string} [start_date] - Start date for availability
 * @param {string} [end_date] - End date for availability
 * @returns {Object[]} Array of hotel objects matching the search criteria
 * @throws {404} No hotels found matching the criteria
 * @throws {500} Failed to search hotels
 * @description Searches for hotels based on the provided criteria and returns matching hotels
 * @example
 * POST /api/v1/hotels/search
 * {
 *   "country": "USA",
 *   "city": "New York",
 *   "start_date": "2023-10-01",
 *   "end_date": "2023-10-10"
 * }
 */
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

/**
 * Get hotel details by ID
 * @route GET /api/v1/hotels/{id}
 * @param {number} id - Hotel ID
 * @returns {Object} Hotel object with details
 * @throws {400} Invalid hotel ID
 * @throws {404} Hotel not found
 * @throws {500} Failed to fetch hotel
 * @description Retrieves detailed information about a specific hotel by its ID
 * @example
 * GET /api/v1/hotels/1
 */
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

/**
 * Get rooms available in a hotel by hotel ID
 * @route GET /api/v1/hotels/{id}/rooms
 * @param {number} id - Hotel ID
 * @returns {Object[]} Array of room objects available in the hotel
 * @throws {400} Invalid hotel ID
 * @throws {404} No rooms found for this hotel
 * @throws {500} Failed to fetch rooms
 * @description Retrieves a list of rooms available in a specific hotel by its ID
 * @example
 * GET /api/v1/hotels/1/rooms
 */
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
router.post("/search", bodyParser(), validateSearchHotels, searchHotels);
router.get("/:id", getHotelById);
router.get("/:id/rooms", getRoomsByHotelId);
router.post(
  "/bookings",
  bodyParser(),
  jwtAuth,
  validateCreateBooking,
  bookingRoutes.createBookingLogic
);
router.get("/private/bookings", jwtAuth, bookingRoutes.getBookingsByRoleLogic);
router.post(
  "/update/bookings",
  bodyParser(),
  jwtAuth,
  validateUpdateBooking,
  bookingRoutes.updateBookingRoute
);

export { router };
