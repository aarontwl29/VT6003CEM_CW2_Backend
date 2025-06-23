import * as db from "../helpers/database";

export const getAll = async (limit = 10, page = 1) => {
  const offset = (page - 1) * limit;
  const query = "SELECT * FROM hotels LIMIT ? OFFSET ?;";
  const data = await db.run_query(query, [limit, offset]);
  return data;
};
