import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./utils/schema.js",
  out: "./drizzle",
  dbCredentials: {
    url: "postgresql://neondb_owner:npg_jHcAuEK1JXm0@ep-black-moon-a8hiom59-pooler.eastus2.azure.neon.tech/mock-ai?sslmode=require",
  },

});
