import Router, { RouterContext } from "koa-router";
import bodyParser from "koa-bodyparser";
import { jwtAuth } from "../controllers/authJWT";
import { validateFavsSchema } from "../controllers/validation";
import { addFavourite, deleteFavourite, listFavourites } from "../models/favs";

const router: Router = new Router({ prefix: "/api/v1/favs" });

/**
 * Route: Add a hotel to favourites
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
 * Route: Remove a hotel from favourites
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
 * Route: List all favourites for a user
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
