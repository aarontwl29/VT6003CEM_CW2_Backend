export const user = {
  $schema: "http://json-schema.org/draft-04/schema#",
  id: "/user",
  title: "User",
  description: "A registered user or staff account",
  type: "object",
  properties: {
    firstname: {
      description: "First name of the user",
      type: "string",
      maxLength: 32,
    },
    lastname: {
      description: "Last name of the user",
      type: "string",
      maxLength: 32,
    },
    username: {
      description: "Unique username",
      type: "string",
      maxLength: 16,
    },
    about: {
      description: "Short personal description",
      type: "string",
    },
    email: {
      description: "Email address",
      type: "string",
      format: "email",
      maxLength: 64,
    },
    password: {
      description: "Password for login",
      type: "string",
      maxLength: 32,
    },
    avatarurl: {
      description: "Profile picture URL",
      oneOf: [
        { type: "string", minLength: 0 },
        { type: "string", format: "uri" },
      ],
    },
    role: {
      description: "User role (user, operator, admin)",
      type: "string",
    },
  },
  required: ["username", "password", "email"],
};
