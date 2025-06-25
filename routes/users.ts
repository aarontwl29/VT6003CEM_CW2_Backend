import { generateToken, jwtAuth } from "../controllers/authJWT";
import { validateUser } from "../controllers/validation";
import Router, { RouterContext } from "koa-router";
import bodyParser from "koa-bodyparser";
import * as model from "../models/users";
import * as bookingRoutes from "./booking";
import bcrypt from "bcryptjs";

const prefix = "/api/v1/users";
const router: Router = new Router({ prefix: prefix });

const getAll = async (ctx: any, next: any) => {
  let users = await model.getAll(20, 1);
  if (users.length) {
    ctx.body = users;
  } else {
    ctx.body = {};
  }
  await next();
};

const doSearch = async (ctx: any, next: any) => {
  let { limit = 50, page = 1, fields = "", q = "" } = ctx.request.query;
  // ensure params are integers
  limit = parseInt(limit);
  page = parseInt(page);
  // validate values to ensure they are sensible
  limit = limit > 200 ? 200 : limit;
  limit = limit < 1 ? 10 : limit;
  page = page < 1 ? 1 : page;
  let result: any;
  // search by single field and field contents
  // need to validate q input
  if (ctx.state.user.user.role === "admin") {
    try {
      if (q !== "") result = await model.getSearch(fields, q);
      else {
        console.log("get all");
        result = await model.getAll(limit, page);
        console.log(result);
      }

      if (result.length) {
        if (fields !== "") {
          // first ensure the fields are contained in an array
          // need this since a single field in the query is passed as a string
          console.log("fields" + fields);
          if (!Array.isArray(fields)) {
            fields = [fields];
          }
          // then filter each row in the array of results
          // by only including the specified fields
          result = result.map((record: any) => {
            let partial: any = {};
            for (let field of fields) {
              partial[field] = record[field];
            }
            return partial;
          });
        }
        console.log(result);
        ctx.body = result;
      }
    } catch (error) {
      return error;
    }
    await next();
  } else {
    ctx.body = { msg: ` ${ctx.state.user.user.role} role is not authorized` };
    ctx.status = 401;
  }
};

const updateUser = async (ctx: any) => {
  let id = +ctx.params.id;
  let c: any = ctx.request.body;
  let pwd: any = c.password;
  let hash: any = ctx.state.user.user.password;

  if (pwd == "") {
    // No update pwd  input
    //console.log('hash '+hash)
    c.password = hash;
    //console.log('c.password '+c.password)
  }
  if (!bcrypt.compareSync(pwd, hash) && pwd != "") {
    //Encrypte & update  new pwd
    const salt = bcrypt.genSaltSync(10);
    const hashpwd = bcrypt.hashSync(`${pwd}`, salt);
    // console.log('hashpwd  '+ hashpwd )
    c.password = hashpwd;
    // console.log('hashpwd  '+ c.password )
  } else {
    c.password = hash;
  } // New pwd = old pwd

  if (ctx.state.user.user.role === "admin" || ctx.state.user.user.id == id) {
    let result = await model.update(c, id);
    // if (result) {
    //   ctx.status = 201;
    //   ctx.body = `User with id ${id} updated`;
    // }
  } else {
    ctx.body = {
      msg: " Profile records can be updated by its owner or admin role",
    };
    ctx.status = 401;
  }
};

const deleteUser = async (ctx: any, next: any) => {
  let id = +ctx.params.id;
  if (ctx.state.user.user.role === "admin" || ctx.state.user.user.id == id) {
    let user = await model.deleteById(id);
    ctx.status = 201;
    ctx.body = `User with id ${id} deleted`;
    await next();
  } else {
    ctx.body = { msg: ` ${ctx.state.user.user.role} role is not authorized` };
    ctx.status = 401;
  }
};

// Own
export const createPublicUser = async (ctx: any) => {
  const body = ctx.request.body;

  const user = {
    firstname: body.firstname || "",
    lastname: body.lastname || "",
    username: body.username,
    about: body.about || "",
    email: body.email,
    password: body.password, // Plain for now, hash recommended
    avatarurl: body.avatarurl || "",
    role: "user",
  };

  try {
    await model.add(user);
    ctx.body = { message: "User registered successfully" };
  } catch (err) {
    ctx.status = 500;
    ctx.body = { message: "Registration failed", error: err };
  }
};

export const createStaffUser = async (ctx: any) => {
  const body = ctx.request.body;

  const signupCode = body.signupCode;
  if (!signupCode) {
    ctx.status = 400;
    ctx.body = { message: "Sign-up code is required for staff registration" };
    return;
  }

  const codeRecord = await model.checkSignupCode(signupCode);
  if (!codeRecord) {
    ctx.status = 403;
    ctx.body = { message: "Invalid or already used sign-up code" };
    return;
  }

  const user = {
    firstname: body.firstname || "",
    lastname: body.lastname || "",
    username: body.username,
    about: body.about || "",
    email: body.email,
    password: body.password,
    avatarurl: body.avatarurl || "",
    role:
      (codeRecord as { generated_for?: string }).generated_for || "operator",
  };

  try {
    await model.add(user);
    await model.markCodeAsUsed(signupCode);
    ctx.body = { message: "Staff account registered successfully" };
  } catch (err) {
    ctx.status = 500;
    ctx.body = { message: "Registration failed", error: err };
  }
};

export const login = async (ctx: RouterContext) => {
  const body = ctx.request.body as { username: string; password: string };
  const { username, password } = body;

  try {
    // Fetch user by username from the database
    const user = (await model.findByUsername(username)) as {
      id: number;
      firstname: string;
      lastname: string;
      username: string;
      about: string;
      email: string;
      password: string;
      avatarurl: string;
      role: string;
    }[];

    // Check if user exists
    if (!user.length) {
      ctx.status = 401;
      ctx.body = { message: "Invalid credentials" };
      return;
    }

    // Validate password directly (no hashing)
    if (user[0].password !== password) {
      ctx.status = 401;
      ctx.body = { message: "Invalid credentials" };
      return;
    }

    // Generate JWT payload
    const payload = {
      id: user[0].id,
      role: user[0].role,
      username: user[0].username,
    };

    // Generate token using authJWT
    const token = generateToken(payload);

    // Respond with the token and user details (excluding password)
    ctx.status = 200;
    ctx.body = {
      message: "Login successful",
      token,
      user: {
        id: user[0].id,
        firstname: user[0].firstname,
        lastname: user[0].lastname,
        username: user[0].username,
        about: user[0].about,
        email: user[0].email,
        avatarurl: user[0].avatarurl,
        role: user[0].role,
      },
    };
  } catch (error) {
    // Handle unexpected errors
    const err = error as Error; // Explicitly cast `error` to `Error`
    ctx.status = 500;
    ctx.body = { message: "Internal server error", error: err.message };
  }
};

export const getRole = async (ctx: RouterContext) => {
  const user = ctx.state.user;

  if (!user || !user.id) {
    ctx.status = 400;
    ctx.body = { message: "Invalid token or user ID not found in token" };
    return;
  }

  try {
    const role = await model.findRoleById(user.id);

    if (role) {
      ctx.status = 200;
      ctx.body = { role };
    } else {
      ctx.status = 404;
      ctx.body = { message: "User not found or role not assigned" };
    }
  } catch (error) {
    const err = error as Error;
    ctx.status = 500;
    ctx.body = { message: "Internal server error", error: err.message };
  }
};

// router.get("/", basicAuth, doSearch);
//router.get('/search', basicAuth, doSearch);

// router.put("/:id([0-9]{1,})", basicAuth, bodyParser(), updateUser);
// router.del("/:id([0-9]{1,})", basicAuth, deleteUser);
// router.post("/login", basicAuth, login);
// new
router.post("/login", bodyParser(), login);
router.post("/public/register", bodyParser(), validateUser, createPublicUser);
router.post("/staff/register", bodyParser(), validateUser, createStaffUser);
router.get("/public/role", jwtAuth, getRole);
router.get(
  "/booking/:id([0-9]{1,})",
  jwtAuth,
  bookingRoutes.getUserInfoById_BookingList
);

export { router };
