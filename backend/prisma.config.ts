import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";

// 1. Force load the .env file from the root directory
dotenv.config();

// 2. Define the configuration using the loaded variable
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
