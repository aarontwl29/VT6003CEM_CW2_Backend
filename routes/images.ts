/**
 * @fileoverview Image serving routes for static image files
 * @description Handles serving of static images including hotel images and user avatars
 * @author VT6003CEM Hotel Booking API
 * @version 1.0.0
 */

import Router, { RouterContext } from "koa-router";
import send from "koa-send";
import path from "path";
import { existsSync } from "fs";

const router: Router = new Router({ prefix: "/api/v1/images" });

/**
 * Serve static images from the public/images directory
 * @route GET /api/v1/images/:filename
 * @param {string} filename - The name of the image file to serve
 * @returns {File} The requested image file
 * @throws {404} Image not found
 * @throws {500} Error serving image
 * @description Serves static image files (JPG, PNG, etc.) for hotels and user avatars
 * @example
 * GET /api/v1/images/hotel1.jpg
 * GET /api/v1/images/avatar-123.png
 */
router.get("/:filename", async (ctx: RouterContext) => {
  const filename = ctx.params.filename;
  const imagePath = path.join(__dirname, "../public/images", filename);

  try {
    // Check if file exists
    if (!existsSync(imagePath)) {
      ctx.status = 404;
      ctx.body = { message: "Image not found" };
      return;
    }

    // Serve the file
    await send(ctx, filename, {
      root: path.join(__dirname, "../public/images"),
    });
  } catch (error) {
    console.error("Error serving image:", error);
    ctx.status = 500;
    ctx.body = { message: "Error serving image" };
  }
});

export { router };
