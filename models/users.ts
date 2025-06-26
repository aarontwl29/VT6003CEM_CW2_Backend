import * as db from "../helpers/database";

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

export const getAll = async (limit = 10, page = 1) => {
  const offset = (page - 1) * limit;
  const query = "SELECT * FROM users LIMIT  ? OFFSET  ?;";
  const data = await db.run_query(query, [limit, offset]);
  return data;
};

export const getSearch = async (sfield: any, q: any) => {
  const query = `SELECT ${sfield} FROM users WHERE ${sfield} LIKE '%${q}%' `;
  try {
    const data = await db.run_query(query, null);
    return data;
  } catch (error) {
    return error;
  }
};

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

export const findByUsername = async (username: string) => {
  const query = "SELECT * FROM users where username = ?";
  const user = await db.run_query(query, [username]);
  return user;
};

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

//Own
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

export const checkSignupCode = async (code: string) => {
  const query = "SELECT * FROM signup_codes WHERE code = ? AND is_used = FALSE";
  try {
    const result = await db.run_query(query, [code]);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    return error;
  }
};

export const markCodeAsUsed = async (code: string) => {
  const query = "UPDATE signup_codes SET is_used = TRUE WHERE code = ?";
  try {
    await db.run_query(query, [code]);
    return { status: 200 };
  } catch (error) {
    return error;
  }
};

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
