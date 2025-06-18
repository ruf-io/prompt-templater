
import { serial, text, pgTable, timestamp, numeric, integer, pgEnum } from 'drizzle-orm/pg-core';

// Define enums
export const triggerTypeEnum = pgEnum('trigger_type', ['SCHEDULED', 'WEBHOOK']);
export const scheduleIntervalEnum = pgEnum('schedule_interval', ['HOURLY', 'DAILY', 'WEEKLY']);

export const promptTemplatesTable = pgTable('prompt_templates', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  prompt_content: text('prompt_content').notNull(),
  openai_model: text('openai_model').notNull().default('gpt-3.5-turbo'),
  temperature: numeric('temperature', { precision: 3, scale: 2 }).notNull().default('0.7'),
  max_tokens: integer('max_tokens').notNull().default(1000),
  trigger_type: triggerTypeEnum('trigger_type').notNull(),
  schedule_interval: scheduleIntervalEnum('schedule_interval'),
  incoming_webhook_url: text('incoming_webhook_url'),
  destination_webhook_url: text('destination_webhook_url').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// TypeScript types for the table schema
export type PromptTemplate = typeof promptTemplatesTable.$inferSelect;
export type NewPromptTemplate = typeof promptTemplatesTable.$inferInsert;

// Export all tables and relations for proper query building
export const tables = { 
  promptTemplates: promptTemplatesTable 
};
