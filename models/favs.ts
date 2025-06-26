import * as db from "../helpers/database";

/**
 * Add a hotel to the user's favourites.
 * @param user_id - The ID of the user.
 * @param hotel_id - The ID of the hotel.
 * @returns Success message or error.
 */
export const addFavourite = async (
  user_id: number,
  hotel_id: number
): Promise<string> => {
  const query = `
    INSERT INTO favourites (user_id, hotel_id)
    VALUES (?, ?)
    ON CONFLICT DO NOTHING; -- Prevent duplicate entries
  `;
  const values = [user_id, hotel_id];

  try {
    await db.run_query(query, values);
    return "Favourite added successfully.";
  } catch (error) {
    console.error("Error adding favourite:", error);
    throw error;
  }
};

/**
 * Remove a hotel from the user's favourites.
 * @param user_id - The ID of the user.
 * @param hotel_id - The ID of the hotel.
 * @returns Success message or error.
 */
export const deleteFavourite = async (
  user_id: number,
  hotel_id: number
): Promise<string> => {
  const query = `
    DELETE FROM favourites
    WHERE user_id = ? AND hotel_id = ?;
  `;
  const values = [user_id, hotel_id];

  try {
    const result = await db.run_query(query, values);
    if (result.length === 0) {
      return "Favourite not found.";
    }
    return "Favourite removed successfully.";
  } catch (error) {
    console.error("Error deleting favourite:", error);
    throw error;
  }
};

/**
 * List all favourites for a user.
 * @param user_id - The ID of the user.
 * @returns List of favourite hotels.
 */
export const listFavourites = async (user_id: number): Promise<any[]> => {
  const query = `
    SELECT h.*
    FROM favourites f
    JOIN hotels h ON f.hotel_id = h.id
    WHERE f.user_id = ?;
  `;
  const values = [user_id];

  try {
    const data = await db.run_query(query, values);
    return data;
  } catch (error) {
    console.error("Error listing favourites:", error);
    throw error;
  }
};
