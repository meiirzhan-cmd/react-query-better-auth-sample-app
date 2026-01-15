import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../auth-schema";

export const db = drizzle(process.env.DB_FILE_NAME!, { schema });
