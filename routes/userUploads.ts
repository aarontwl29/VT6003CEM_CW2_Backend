import Router, { RouterContext } from "koa-router";
import koaBody from "koa-body";
import mime from "mime-types";
import { copyFileSync, existsSync, mkdirSync } from "fs";
import { v4 as uuidv4 } from "uuid";
import { update } from "../models/users";
import { jwtAuth } from "../controllers/authJWT";

const uploadOptions = {
  multipart: true,
  formidable: {
    uploadDir: "./tmp/uploads", // Temporary storage
    maxFileSize: 5 * 1024 * 1024, // 5MB limit
    keepExtensions: true,
  },
};

const koaBodyM = koaBody(uploadOptions);
const fileStore: string = "./public/images"; // Permanent storage
const router: Router = new Router({ prefix: "/api/v1/users" });

// Ensure directories exist
if (!existsSync("./tmp/uploads")) {
  mkdirSync("./tmp/uploads", { recursive: true });
}
if (!existsSync("./public/images")) {
  mkdirSync("./public/images", { recursive: true });
}

router.post("/upload-avatar", jwtAuth, koaBodyM, async (ctx: RouterContext) => {
  const userId = ctx.state.user?.id;
  const upload = ctx.request.files?.upload;

  console.log("Upload request received for user:", userId);
  console.log("Files received:", ctx.request.files);

  if (!userId) {
    ctx.status = 400;
    ctx.body = { message: "User ID not found in token" };
    return;
  }

  if (!upload) {
    ctx.status = 400;
    ctx.body = { message: "No file uploaded" };
    return;
  }

  try {
    let path: string | undefined;
    let type: string | undefined;
    let originalName: string | undefined;

    if (Array.isArray(upload)) {
      path = upload[0].filepath;
      type = upload[0].mimetype || "";
      originalName = upload[0].originalFilename || "";
    } else {
      path = upload.filepath;
      type = upload.mimetype || "";
      originalName = upload.originalFilename || "";
    }

    console.log("File details:");
    console.log("- Temporary path:", path);
    console.log("- MIME type:", type);
    console.log("- Original name:", originalName);

    // Validate file type (only images)
    if (!type.startsWith("image/")) {
      ctx.status = 400;
      ctx.body = { message: "Only image files are allowed" };
      return;
    }

    // Check if temporary file exists
    if (!path || !existsSync(path)) {
      throw new Error(`Temporary file does not exist: ${path}`);
    }

    const extension = mime.extension(type) || "jpg";
    const imageName = `${uuidv4()}.${extension}`;
    const newPath = `${fileStore}/${imageName}`;

    console.log("Copying file from:", path);
    console.log("Copying file to:", newPath);

    // Copy file to permanent storage
    copyFileSync(path, newPath);

    // Update user's avatar URL in database
    const avatarUrl = `http://${ctx.host}/images/${imageName}`;
    await update({ avatarurl: avatarUrl }, userId);

    console.log("File uploaded successfully:", avatarUrl);

    ctx.status = 201;
    ctx.body = {
      message: "Avatar uploaded successfully",
      avatarUrl,
      filename: imageName,
      originalName,
    };
  } catch (err: any) {
    console.error("Error uploading avatar:", err.message);
    ctx.status = 500;
    ctx.body = { message: "Failed to upload avatar", error: err.message };
  }
});

export { router };
