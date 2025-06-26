import * as db from "../helpers/database";

/**
 * Get the latest message by booking ID and user ID.
 * @param booking_id - The ID of the booking.
 * @param user_id - The ID of the user (sender or recipient).
 * @param index - The minimum message ID to filter (optional).
 * @returns The latest message matching the criteria.
 */
export const getLatestMessageByBookingIdAndUserId = async (
  booking_id: number,
  user_id: number,
  index: number = 0
): Promise<any | null> => {
  const query = `
    SELECT *
    FROM messages
    WHERE booking_id = ?
      AND (sender_id = ? OR recipient_id = ?)
      AND id > ?
    ORDER BY id DESC
    LIMIT 1;
  `;

  const values = [booking_id, user_id, user_id, index];

  try {
    const data = await db.run_query(query, values);
    return data.length > 0 ? data[0] : null; // Return the latest message or null if no records found
  } catch (error) {
    console.error("Error retrieving the latest message:", error);
    throw error;
  }
};
