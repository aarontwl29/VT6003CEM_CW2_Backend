/**
 * @fileoverview User favourites management routes
 * @description Handles adding, removing, and listing user favourite hotels
 * @author VT6003CEM Hotel Booking API
 * @version 1.0.0
 */

import Router, { RouterContext } from "koa-router";
import bodyParser from "koa-bodyparser";
import { jwtAuth } from "../controllers/authJWT";
import { validateFavsSchema } from "../controllers/validation";
import { addFavourite, deleteFavourite, listFavourites } from "../models/favs";

const router: Router = new Router({ prefix: "/api/v1/favs" });

/**
 * Add a hotel to user's favourites
 * @route POST /api/v1/favs/add
 * @param {number} hotel_id - ID of the hotel to add to favourites
 * @returns {Object} Success message
 * @throws {400} Missing user ID or hotel ID
 * @throws {401} Unauthorized - Valid JWT token required
 * @throws {409} Hotel already in favourites
 * @throws {500} Failed to add favourite
 * @description Adds a hotel to the authenticated user's favourites list
 * @security Bearer token required
 * @example
 * POST /api/v1/favs/add
 * { "hotel_id": 123 }
 */
const addFavouriteRoute = async (ctx: RouterContext, next: any) => {
  const user_id = ctx.state.user?.id;
  const { hotel_id } = ctx.request.body as { hotel_id: number };

  if (!user_id || !hotel_id) {
    ctx.status = 400;
    ctx.body = { message: "Missing user ID or hotel ID" };
    return;
  }

  try {
    const result = await addFavourite(user_id, hotel_id);
    ctx.status = 200;
    ctx.body = { message: result };
  } catch (error) {
    console.error("Error adding favourite:", error);
    ctx.status = 500;
    ctx.body = {
      message: "Failed to add favourite",
      error: error instanceof Error ? error.message : String(error),
    };
  }

  await next();
};

/**
 * Remove a hotel from user's favourites
 * @route DELETE /api/v1/favs/delete
 * @param {number} hotel_id - ID of the hotel to remove from favourites
 * @returns {Object} Success message
 * @throws {400} Missing user ID or hotel ID
 * @throws {401} Unauthorized - Valid JWT token required
 * @throws {404} Hotel not found in favourites
 * @throws {500} Failed to delete favourite
 * @description Removes a hotel from the authenticated user's favourites list
 * @security Bearer token required
 * @example
 * DELETE /api/v1/favs/delete
 * { "hotel_id": 123 }
 */
const deleteFavouriteRoute = async (ctx: RouterContext, next: any) => {
  const user_id = ctx.state.user?.id;
  const { hotel_id } = ctx.request.body as { hotel_id: number };

  if (!user_id || !hotel_id) {
    ctx.status = 400;
    ctx.body = { message: "Missing user ID or hotel ID" };
    return;
  }

  try {
    const result = await deleteFavourite(user_id, hotel_id);
    ctx.status = 200;
    ctx.body = { message: result };
  } catch (error) {
    console.error("Error deleting favourite:", error);
    ctx.status = 500;
    ctx.body = {
      message: "Failed to delete favourite",
      error: error instanceof Error ? error.message : String(error),
    };
  }

  await next();
};

/**
 * List all favourites for a user
 * @route GET /api/v1/favs/list
 * @returns {Array} List of favourite hotels
 * @throws {401} Unauthorized - Valid JWT token required
 * @throws {500} Failed to list favourites
 * @description Retrieves a list of all hotels favourited by the authenticated user
 * @security Bearer token required
 * @example
 * GET /api/v1/favs/list
 */
const listFavouritesRoute = async (ctx: RouterContext, next: any) => {
  const user_id = ctx.state.user?.id;

  if (!user_id) {
    ctx.status = 400;
    ctx.body = { message: "Missing user ID" };
    return;
  }

  try {
    const favourites = await listFavourites(user_id);
    ctx.status = 200;
    ctx.body = favourites;
  } catch (error) {
    console.error("Error listing favourites:", error);
    ctx.status = 500;
    ctx.body = {
      message: "Failed to list favourites",
      error: error instanceof Error ? error.message : String(error),
    };
  }

  await next();
};

router.post(
  "/add",
  bodyParser(),
  jwtAuth,
  validateFavsSchema,
  addFavouriteRoute
);
router.delete(
  "/delete",
  bodyParser(),
  jwtAuth,
  validateFavsSchema,
  deleteFavouriteRoute
);
router.get("/list", jwtAuth, listFavouritesRoute);

export { router };
