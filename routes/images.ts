import Router, { RouterContext } from "koa-router";
import send from "koa-send";
import path from "path";
import { existsSync } from "fs";

const router: Router = new Router({ prefix: "/api/v1/images" });

// Serve images from the public/images directory
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
