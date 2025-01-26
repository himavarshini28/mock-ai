import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const MockInterview = pgTable('mockInterview', {
    id: serial('id').primaryKey(),
    jsonMockResp: text('jsonMockResp').notNull(),
    jobPosition: varchar('jobPosition', { length: 255 }).notNull(),
    jobDesc: varchar('jobDesc', { length: 500 }).notNull(),
    jobExperience: varchar('jobExperience', { length: 100 }).notNull(),
    createdBy: varchar('createdBy', { length: 255 }).notNull(),
    createdAt: varchar('createdAt', { length: 255 }).notNull(),
    mockId: varchar('mockId', { length: 36 }).notNull(), // UUID length is typically 36
});
