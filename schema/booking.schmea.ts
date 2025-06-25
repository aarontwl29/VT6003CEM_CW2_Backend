export const booking = {
  $schema: "http://json-schema.org/draft-04/schema#",
  id: "/booking",
  title: "Booking",
  description: "A booking made by a user",
  type: "object",
  properties: {
    user_id: {
      description: "ID of the user making the booking",
      type: "integer",
    },
    start_date: {
      description: "Start date of the booking",
      type: "string",
      format: "date",
    },
    end_date: {
      description: "End date of the booking",
      type: "string",
      format: "date",
    },
    staff_email: {
      description: "Email of the staff assigned to the booking (optional)",
      type: ["string", "null"],
      format: "email",
    },
    first_message: {
      description: "Initial message from the user",
      type: "string",
    },
    room_ids: {
      description: "List of room IDs associated with the booking",
      type: "array",
      items: {
        type: "integer",
      },
      minItems: 1,
    },
    status: {
      description: "Status of the booking (pending, approved, cancelled)",
      type: "string",
      enum: ["pending", "approved", "cancelled"],
    },
  },
  required: ["user_id", "start_date", "end_date", "room_ids"],
};
