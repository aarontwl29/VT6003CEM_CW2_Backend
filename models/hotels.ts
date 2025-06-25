import * as db from "../helpers/database";

export const getAll = async (limit = 10, page = 1) => {
  const offset = (page - 1) * limit;
  const query = "SELECT * FROM hotels LIMIT ? OFFSET ?;";
  const data = await db.run_query(query, [limit, offset]);
  return data;
};

// export const getSearch = async (filters: {
//   country?: string;
//   city?: string;
//   start_date?: string;
//   end_date?: string;
// }) => {
//   const conditions: string[] = [];
//   const values: any[] = [];

//   if (filters.country) {
//     conditions.push("h.country = ?");
//     values.push(filters.country);
//   }

//   if (filters.city) {
//     conditions.push("h.city = ?");
//     values.push(filters.city);
//   }

//   if (filters.start_date && filters.end_date) {
//     conditions.push(`
//       NOT EXISTS (
//         SELECT 1
//         FROM bookings b
//         WHERE b.room_id = r.id
//           AND b.start_date <= ?
//           AND b.end_date >= ?
//       )
//     `);
//     values.push(filters.start_date, filters.end_date);
//   }

//   const query = `
//     SELECT
//       h.name AS hotel_name,
//       h.review_count,
//       h.rating AS star,
//       h.country,
//       h.city,
//       h.address,
//       r.has_discount,
//       CASE
//         WHEN r.has_discount THEN r.price_per_night * (1 - r.discount_rate)
//         ELSE r.price_per_night
//       END AS price_per_night,
//       r.capacity,
//       r.bed_option,
//       r.amenities
//     FROM
//       hotels h
//     JOIN
//       rooms r ON h.id = r.hotel_id
//     WHERE
//       r.capacity >= 2 -- Only rooms with capacity of at least 2
//       ${conditions.length ? "AND " + conditions.join(" AND ") : ""}
//     ORDER BY
//       CASE
//         WHEN r.has_discount THEN r.price_per_night * (1 - r.discount_rate)
//         ELSE r.price_per_night
//       END ASC -- Sort by the cheapest price (including discount)
//     LIMIT 1; -- Only return the cheapest room
//   `;

//   try {
//     const data = await db.run_query(query, values);
//     return data;
//   } catch (error) {
//     return error;
//   }
// };

export const getHotels = async (filters: {
  country?: string;
  city?: string;
  start_date?: string;
  end_date?: string;
}) => {
  const conditions: string[] = [];
  const values: any[] = [];

  if (filters.country) {
    conditions.push("country = ?");
    values.push(filters.country);
  }

  if (filters.city) {
    conditions.push("city = ?");
    values.push(filters.city);
  }

  // if (filters.start_date && filters.end_date) {
  //   conditions.push(`
  //     NOT EXISTS (
  //       SELECT 1
  //       FROM bookings b
  //       WHERE b.room_id IN (
  //         SELECT id FROM rooms WHERE hotel_id = hotels.id
  //       )
  //       AND b.start_date <= ?
  //       AND b.end_date >= ?
  //     )
  //   `);
  //   values.push(filters.start_date, filters.end_date);
  // }

  const query = `
    SELECT 
      id, name, description, city, country, address, rating, review_count, image_url
    FROM 
      hotels
    ${conditions.length ? "WHERE " + conditions.join(" AND ") : ""}
  `;

  try {
    const data = await db.run_query(query, values);
    return data;
  } catch (error) {
    return error;
  }
};

export const getCheapestRoom = async (hotel_id: number) => {
  const query = `
    SELECT 
      price_per_night AS original_price,
      price_per_night * (1 - discount_rate) AS discounted_price
    FROM 
      rooms
    WHERE 
      hotel_id = ?
      AND capacity >= 2
      AND has_discount = TRUE
    ORDER BY 
      discounted_price ASC
    LIMIT 1
  `;

  try {
    const data = (await db.run_query(query, [hotel_id])) as {
      original_price: number;
      discounted_price: number;
    }[];
    return data.length ? data[0] : null;
  } catch (error) {
    return error;
  }
};

export const getHotelById = async (hotel_id: number) => {
  const query = `
    SELECT 
      id,
      name,
      description,
      city,
      country,
      address,
      rating,
      review_count,
      image_url
    FROM 
      hotels
    WHERE 
      id = ?
  `;

  try {
    const data = await db.run_query(query, [hotel_id]);
    console.log("Hotel query result:", data);
    return data.length ? data[0] : null;
  } catch (error) {
    console.error("Database query error:", error);
    return error;
  }
};

export const getRoomsByHotelId = async (hotel_id: number) => {
  const query = `
    SELECT 
      id,
      hotel_id,
      capacity,
      bed_option,
      price_per_night,
      has_discount,
      discount_rate,
      CASE
        WHEN has_discount THEN price_per_night * (1 - discount_rate)
        ELSE price_per_night
      END AS actual_price,
      amenities
    FROM 
      rooms
    WHERE 
      hotel_id = ?
    ORDER BY 
      actual_price ASC
  `;

  try {
    const data = await db.run_query(query, [hotel_id]);
    console.log("Rooms query result:", data);
    return data;
  } catch (error) {
    console.error("Database query error:", error);
    return error;
  }
};

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

// Retrieve booking details by ID
export const getBookingById = async (booking_id: number) => {
  const query = `
    SELECT 
      b.id AS booking_id,
      b.user_id,
      b.start_date,
      b.end_date,
      b.staff_email,
      b.first_message,
      br.room_id,
      r.hotel_id,
      r.capacity,
      r.bed_option,
      r.amenities,
      r.price_per_night
    FROM 
      bookings b
    LEFT JOIN 
      booking_rooms br ON b.id = br.booking_id
    LEFT JOIN 
      rooms r ON br.room_id = r.id
    WHERE 
      b.id = ?;
  `;
  try {
    const data = await db.run_query(query, [booking_id]);
    return data.length ? data : null; // Return booking details
  } catch (error) {
    console.error("Error retrieving booking details:", error);
    throw error;
  }
};

// Retrieve all bookings for a user
export const getBookingsByUserId = async (user_id: number) => {
  const query = `
    SELECT 
      b.id AS booking_id,
      b.start_date,
      b.end_date,
      b.staff_email,
      b.first_message,
      br.room_id,
      r.hotel_id,
      r.capacity,
      r.bed_option,
      r.amenities,
      r.price_per_night
    FROM 
      bookings b
    LEFT JOIN 
      booking_rooms br ON b.id = br.booking_id
    LEFT JOIN 
      rooms r ON br.room_id = r.id
    WHERE 
      b.user_id = ?;
  `;
  try {
    const data = await db.run_query(query, [user_id]);
    return data.length ? data : null; // Return all bookings for the user
  } catch (error) {
    console.error("Error retrieving bookings for user:", error);
    throw error;
  }
};
