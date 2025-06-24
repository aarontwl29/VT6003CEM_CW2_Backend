import { Validator, ValidationError } from "jsonschema";
import { RouterContext } from "koa-router";

import { user } from "../schema/user.schema";

const v = new Validator();

export const validateUser = async (ctx: RouterContext, next: any) => {
  const validationOptions = {
    throwError: true,
    allowUnknownAttributes: false,
  };

  const body = ctx.request.body;

  try {
    const validationResult = v.validate(body, user, validationOptions);

    if (!validationResult.valid) {
      ctx.status = 400;
      ctx.body = {
        message: "Validation failed",
        errors: validationResult.errors.map((error) => ({
          property: error.property,
          message: error.message,
        })),
      };
      return;
    }

    await next();
  } catch (error) {
    if (error instanceof ValidationError) {
      ctx.status = 400;
      ctx.body = {
        message: "Validation failed",
        details: error.stack || error.message,
      };
    } else {
      throw error;
    }
  }
};
