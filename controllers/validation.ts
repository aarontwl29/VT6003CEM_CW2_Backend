import { Validator, ValidationError } from "jsonschema";
import { RouterContext } from "koa-router";

import { user } from "../schema/user.schema";
import { searchHotelsSchema } from "../schema/searchHotels.schema";
import { createBookingSchema } from "../schema/createBooking.schema";

const v = new Validator();

// Validation for user schema
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

// Validation for searchHotels schema
export const validateSearchHotels = async (ctx: RouterContext, next: any) => {
  const validationOptions = {
    throwError: true,
    allowUnknownAttributes: false,
  };

  const body = ctx.request.body;

  try {
    const validationResult = v.validate(
      body,
      searchHotelsSchema,
      validationOptions
    );

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

// Validation for createBooking schema
export const validateCreateBooking = async (ctx: RouterContext, next: any) => {
  const validationOptions = {
    throwError: true,
    allowUnknownAttributes: false,
  };

  const body = ctx.request.body;

  try {
    const validationResult = v.validate(body, createBookingSchema, validationOptions);

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
