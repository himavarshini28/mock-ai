import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './utils/schema.js',
  dialect: 'postgresql',
  dbCredentials: {
    url:"postgresql://neondb_owner:npg_sBxS1ZUIL6Of@ep-nameless-poetry-a892j53h-pooler.eastus2.azure.neon.tech/mock-ai?sslmode=require",
  },
});
