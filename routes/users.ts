import { basicAuth } from "../controllers/auth";
import { generateToken } from "../controllers/authJWT";
import { validateUser } from "../controllers/validation";
import Router, { RouterContext } from "koa-router";
import bodyParser from "koa-bodyparser";
import * as model from "../models/users";
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

const getById = async (ctx: any, next: any) => {
  let id = ctx.params.id;
  console.log("user.id " + ctx.state.user.user.id);
  console.log("params.id " + id);
  if (ctx.state.user.user.role === "admin" || ctx.state.user.user.id == id) {
    let user = await model.getByUserId(id);
    if (user.length) {
      ctx.body = user[0];
    }
  } else {
    ctx.body = { msg: ` ${ctx.state.user.user.role} role is not authorized` };
    ctx.status = 401;
  }
};

// const login = async (ctx: any, next: any) => {
//   // return any details needed by the client
//   const user = ctx.state.user;
//   // const { id, username, email, avatarurl, role } =ctx.state.user;
//   const id: number = user.user.id;
//   const username: string = user.user.username;
//   const email: string = user.user.email;
//   const avatarurl: string = user.user.avatarurl;
//   const about: string = user.user.about;
//   const role: string = user.user.role;
//   const links = {
//     self: `http://${ctx.host}${prefix}/${id}`,
//   };
//   ctx.body = { id, username, email, about, avatarurl, role, links };
// };

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
  const body = ctx.request.body as { username: string; password: string }; // Explicitly define the type for `body`
  const { username, password } = body;

  try {
    // Fetch user by username from the database
    const user = (await model.findByUsername(username)) as {
      id: number;
      username: string;
      password: string;
      role: string;
    }[]; // Explicitly define the type for `user`

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

    // Respond with the token
    ctx.status = 200;
    ctx.body = {
      message: "Login successful",
      token,
    };
  } catch (error) {
    // Handle unexpected errors
    const err = error as Error; // Explicitly cast `error` to `Error`
    ctx.status = 500;
    ctx.body = { message: "Internal server error", error: err.message };
  }
};

router.get("/", basicAuth, doSearch);
//router.get('/search', basicAuth, doSearch);

router.get("/:id([0-9]{1,})", basicAuth, getById);
router.put("/:id([0-9]{1,})", basicAuth, bodyParser(), updateUser);
router.del("/:id([0-9]{1,})", basicAuth, deleteUser);
// router.post("/login", basicAuth, login);
// new
router.post("/login", bodyParser(), login);
router.post("/public/register", bodyParser(), validateUser, createPublicUser);
router.post("/staff/register", bodyParser(), validateUser, createStaffUser);

export { router };
