import * as db from "../helpers/database";

export const getAll = async (limit = 10, page = 1) => {
  const offset = (page - 1) * limit;
  const query = "SELECT * FROM hotels LIMIT ? OFFSET ?;";
  const data = await db.run_query(query, [limit, offset]);
  return data;
};

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
    return data;
  } catch (error) {
    console.error("Database query error:", error);
    return error;
  }
};
