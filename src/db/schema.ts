import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const crawledPages = sqliteTable('crawled_pages', {
  id: integer('id').primaryKey(),
  url: text('url').notNull().unique(),
  html: text('html').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
}); 
