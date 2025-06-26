/**
 * @fileoverview User model and database operations
 * @description Handles all user-related database operations and data structures
 * @author VT6003CEM Hotel Booking API
 * @version 1.0.0
 */

import * as db from "../helpers/database";

/**
 * User interface definition
 * @interface User
 * @property {number} id - Unique user identifier
 * @property {string} firstname - User's first name
 * @property {string} lastname - User's last name
 * @property {string} username - Unique username
 * @property {string|null} about - User bio/description
 * @property {string} email - User's email address
 * @property {string} password - Hashed password
 * @property {string|null} avatarurl - URL to user's avatar image
 * @property {string} role - User role (admin, operator, user, etc.)
 */
export interface User {
  id: number;
  firstname: string;
  lastname: string;
  username: string;
  about: string | null;
  email: string;
  password: string;
  avatarurl: string | null;
  role: string; // Role of the user ('admin', 'operator', 'user', etc.)
}

/**
 * Get all users with pagination
 * @param {number} [limit=10] - Maximum number of users to return
 * @param {number} [page=1] - Page number for pagination
 * @returns {Promise<User[]>} Array of user objects
 * @throws {Error} Database query error
 * @description Retrieves a paginated list of all users from the database
 * @example
 * const users = await getAll(20, 1); // Get first 20 users
 */
export const getAll = async (limit = 10, page = 1) => {
  const offset = (page - 1) * limit;
  const query = "SELECT * FROM users LIMIT  ? OFFSET  ?;";
  const data = await db.run_query(query, [limit, offset]);
  return data;
};

/**
 * Search for users by a specific field
 * @param {any} sfield - The field to search in (e.g., 'username', 'email')
 * @param {any} q - The search query
 * @returns {Promise<User[]>} Array of user objects matching the search criteria
 * @throws {Error} Database query error
 * @description Performs a search for users based on a specific field and query
 * @example
 * const users = await getSearch('username', 'john'); // Search for users with 'john' in their username
 */
export const getSearch = async (sfield: any, q: any) => {
  const query = `SELECT ${sfield} FROM users WHERE ${sfield} LIKE '%${q}%' `;
  try {
    const data = await db.run_query(query, null);
    return data;
  } catch (error) {
    return error;
  }
};

/**
 * Get a user by their unique ID
 * @param {number} id - The ID of the user to retrieve
 * @returns {Promise<User|null>} The user object if found, null otherwise
 * @throws {Error} Database query error
 * @description Retrieves a user from the database by their unique ID
 * @example
 * const user = await getByUserId(1); // Get user with ID 1
 */
export const getByUserId = async (id: number): Promise<User | null> => {
  const query = "SELECT * FROM users WHERE id = ?;";
  const values = [id];

  try {
    const data = await db.run_query(query, values);
    if (data.length === 0) {
      return null; // Return null if no user is found
    }
    return data[0] as User;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in getByUserId:", error.message);
    } else {
      console.error("Error in getByUserId:", error);
    }
    throw error;
  }
};

/**
 * Find a user by their username
 * @param {string} username - The username of the user to find
 * @returns {Promise<User[]>} Array of user objects matching the username
 * @throws {Error} Database query error
 * @description Searches for a user in the database by their username
 * @example
 * const user = await findByUsername('johndoe'); // Find user with username 'johndoe'
 */
export const findByUsername = async (username: string) => {
  const query = "SELECT * FROM users where username = ?";
  const user = await db.run_query(query, [username]);
  return user;
};

/**
 * Update a user's information
 * @param {any} user - The user object containing updated information
 * @param {number} id - The ID of the user to update
 * @returns {Promise<User|null>} The updated user object, or null if not found
 * @throws {Error} Database query error
 * @description Updates a user's information in the database
 * @example
 * const updatedUser = await update({ firstname: 'John' }, 1); // Update user with ID 1
 */
export const update = async (user: any, id: number) => {
  // Extract keys and values from the user object
  const keys = Object.keys(user);
  const values = Object.values(user);

  // Build the update string dynamically
  const updateString = keys.map((key, index) => `${key} = ?`).join(", ");

  // Construct the SQL query
  const query = `UPDATE users SET ${updateString} WHERE id = ? RETURNING *;`;

  try {
    // Execute the query with values and the user ID
    const result = await db.run_query(query, [...values, id]);
    return result.length > 0 ? result[0] : null; // Return the updated user
  } catch (error) {
    console.error("Error in update:", error);
    throw error;
  }
};

/**
 * Delete a user by their ID
 * @param {any} id - The ID of the user to delete
 * @returns {Promise<{ affectedRows: number }>} Result object indicating the number of affected rows
 * @throws {Error} Database query error
 * @description Deletes a user from the database by their ID
 * @example
 * await deleteById(1); // Delete user with ID 1
 */
export const deleteById = async (id: any) => {
  let query = "Delete FROM users WHERE ID = ?";
  let values = [id];
  try {
    await db.run_query(query, values);
    return { affectedRows: 1 };
  } catch (error) {
    return error;
  }
};

/**
 * Add a new user to the database
 * @param {any} user - The user object containing user information
 * @returns {Promise<{ status: number }>} Result object indicating the status of the operation
 * @throws {Error} Database query error
 * @description Adds a new user to the database
 * @example
 * await add({ firstname: 'John', lastname: 'Doe' }); // Add a new user
 */
export const add = async (user: any) => {
  let keys = Object.keys(user);
  let values = Object.values(user);
  let key = keys.join(",");
  let parm = values.map(() => "?").join(",");
  let query = `INSERT INTO users (${key}) VALUES (${parm})`;

  try {
    await db.run_query(query, values);
    return { status: 201 };
  } catch (error) {
    return error;
  }
};

/**
 * Check if a signup code is valid and not used
 * @param {string} code - The signup code to check
 * @returns {Promise<User|null>} The user object if the code is valid, null otherwise
 * @throws {Error} Database query error
 * @description Checks the validity of a signup code
 * @example
 * const codeInfo = await checkSignupCode('ABC123'); // Check signup code 'ABC123'
 */
export const checkSignupCode = async (code: string) => {
  const query = "SELECT * FROM signup_codes WHERE code = ? AND is_used = FALSE";
  try {
    const result = await db.run_query(query, [code]);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    return error;
  }
};

/**
 * Mark a signup code as used
 * @param {string} code - The signup code to mark as used
 * @returns {Promise<{ status: number }>} Result object indicating the status of the operation
 * @throws {Error} Database query error
 * @description Marks a signup code as used in the database
 * @example
 * await markCodeAsUsed('ABC123'); // Mark signup code 'ABC123' as used
 */
export const markCodeAsUsed = async (code: string) => {
  const query = "UPDATE signup_codes SET is_used = TRUE WHERE code = ?";
  try {
    await db.run_query(query, [code]);
    return { status: 200 };
  } catch (error) {
    return error;
  }
};

/**
 * Find the role of a user by their ID
 * @param {number} id - The ID of the user
 * @returns {Promise<string|null>} The role of the user if found, null otherwise
 * @throws {Error} Database query error
 * @description Retrieves the role of a user from the database by their ID
 * @example
 * const role = await findRoleById(1); // Get role of user with ID 1
 */
export const findRoleById = async (id: number) => {
  const query = "SELECT role FROM users WHERE id = ?";
  try {
    const result = (await db.run_query(query, [id])) as { role: string }[];
    return result.length > 0 ? result[0].role : null;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch role: ${error.message}`);
    } else {
      throw new Error("Failed to fetch role: Unknown error");
    }
  }
};
