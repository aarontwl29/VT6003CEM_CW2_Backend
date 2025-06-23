import Router, { RouterContext } from "koa-router";
import bodyParser from "koa-bodyparser";
import * as model from "../models/hotels";

import { validateArticle } from "../controllers/validation";
import { basicAuth } from "../controllers/auth";

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

router.get("/", getAll);
router.post("/search", bodyParser(), searchHotels);

export { router };
