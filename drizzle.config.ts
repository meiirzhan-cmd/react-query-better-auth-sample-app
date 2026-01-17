import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./schemas/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true, // Print all SQL statements during drizzle-kit push command
  strict: true, // Prompts confirmation to run printed SQL statements when running drizzle-kit push command.
});
