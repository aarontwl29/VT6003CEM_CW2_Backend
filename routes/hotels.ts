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

router.get("/", getAll);

export { router };
