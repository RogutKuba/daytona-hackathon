import { Id } from '@/lib/id';
import { pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const experimentsTable = pgTable('experiments', {
  id: text('id').$type<Id<'experiment'>>().primaryKey(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow(),
  repoUrl: text('repo_url').notNull(),
  goal: text('goal').notNull(),
  status: text('status')
    .$type<'pending' | 'running' | 'completed' | 'failed'>()
    .notNull()
    .default('pending'),
  variantSuggestions: jsonb('variant_suggestions').$type<string[]>(),
});

export type ExperimentEntity = typeof experimentsTable.$inferSelect;
