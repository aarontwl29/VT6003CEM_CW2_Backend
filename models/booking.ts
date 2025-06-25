import * as db from "../helpers/database";

// Create a new booking
export const createBooking = async (
  user_id: number,
  start_date: string,
  end_date: string,
  staff_email: string | null,
  first_message: string
) => {
  const query = `
    INSERT INTO bookings (user_id, start_date, end_date, staff_email, first_message)
    VALUES (?, ?, ?, ?, ?)
    RETURNING id;
  `;
  const values = [user_id, start_date, end_date, staff_email, first_message];
  try {
    const result = (await db.run_query(query, values)) as { id: number }[];
    return result.length ? result[0].id : null; // Return the booking ID
  } catch (error) {
    console.error("Error in createBooking:", error); // Log the error
    throw error;
  }
};

// Associate rooms with a booking
export const addRoomsToBooking = async (
  booking_id: number,
  room_ids: number[]
) => {
  const query = `
    INSERT INTO booking_rooms (booking_id, room_id)
    VALUES ${room_ids.map(() => "(?, ?)").join(", ")};
  `;
  const values = room_ids.flatMap((room_id) => [booking_id, room_id]);
  try {
    await db.run_query(query, values);
    return true;
  } catch (error) {
    console.error("Error in addRoomsToBooking:", error); // Log the error
    throw error;
  }
};

// Retrieve all bookings for staff
export const getBookingsForStaff = async (staff_email: string) => {
  const query = `
    SELECT 
      b.id AS booking_id,
      b.user_id,
      b.start_date,
      b.end_date,
      b.staff_email,
      b.first_message
    FROM 
      bookings b
    WHERE 
      b.staff_email IS NULL OR b.staff_email = ? OR b.staff_email = ''
    ORDER BY 
      b.start_date DESC, b.end_date DESC;
  `;

  try {
    const data = await db.run_query(query, [staff_email]);
    return data;
  } catch (error) {
    console.error("Error retrieving bookings for staff:", error);
    throw error;
  }
};

// For public users, retrieve bookings by user ID
// This function is used to retrieve bookings for a specific user
export const getBookingsByUserId = async (user_id: number) => {
  const query = `
    SELECT 
      b.id AS booking_id,
      b.user_id,
      b.start_date,
      b.end_date,
      b.staff_email,
      b.first_message
    FROM 
      bookings b
    WHERE 
      b.user_id = ?
    ORDER BY 
      b.start_date DESC, b.end_date DESC;
  `;

  try {
    const data = await db.run_query(query, [user_id]);
    return data;
  } catch (error) {
    console.error("Error retrieving bookings for user:", error);
    throw error;
  }
};

// Retrieve booking rooms for a specific booking
export const getBookingRoomsByBookingId = async (booking_id: number) => {
  const query = `
    SELECT 
      br.id AS booking_room_id,
      br.status AS booking_status,
      r.id AS room_id,
      r.hotel_id,
      r.capacity,
      r.bed_option,
      r.amenities,
      r.price_per_night,
      r.has_discount,
      r.discount_rate,
      CASE
        WHEN r.has_discount THEN r.price_per_night * (1 - r.discount_rate)
        ELSE r.price_per_night
      END AS actual_price,
      h.name AS hotel_name,
      h.city AS hotel_city,
      h.country AS hotel_country
    FROM 
      booking_rooms br
    LEFT JOIN 
      rooms r ON br.room_id = r.id
    LEFT JOIN 
      hotels h ON r.hotel_id = h.id
    WHERE 
      br.booking_id = ?
    ORDER BY 
      r.price_per_night ASC;
  `;

  try {
    const data = await db.run_query(query, [booking_id]);
    return data;
  } catch (error) {
    console.error("Error retrieving booking rooms:", error);
    throw error;
  }
};

export const updateBooking = async (
  booking_id: number,
  start_date: string,
  end_date: string,
  room_updates: {
    room_id: number;
    status: "pending" | "approved" | "cancelled";
    staff_id: number;
  }[],
  sender_id: number, // Staff ID
  recipient_id: number, // User ID
  message: string
) => {
  const updateBookingQuery = `
    UPDATE bookings
    SET start_date = ?, end_date = ?
    WHERE id = ?;
  `;

  const updateRoomStatusQuery = `
    UPDATE booking_rooms
    SET status = ?, staff_id = ?
    WHERE booking_id = ? AND room_id = ?;
  `;

  const insertMessageQuery = `
    INSERT INTO messages (booking_id, sender_id, recipient_id, message)
    VALUES (?, ?, ?, ?);
  `;

  try {
    // Update booking start and end dates
    await db.run_query(updateBookingQuery, [start_date, end_date, booking_id]);

    // Update room statuses and record staff ID
    for (const room of room_updates) {
      await db.run_query(updateRoomStatusQuery, [
        room.status,
        room.staff_id,
        booking_id,
        room.room_id,
      ]);
    }

    // Insert a new message
    await db.run_query(insertMessageQuery, [
      booking_id,
      sender_id,
      recipient_id,
      message,
    ]);

    return { message: "Booking updated successfully" };
  } catch (error) {
    console.error("Error in updateBooking:", error);
    throw error;
  }
};
