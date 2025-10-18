import { Id } from '@/lib/id';
import { text, pgTable, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { experimentsTable } from './experiment.db';

export const variantsTable = pgTable('variants', {
  id: text('id').$type<Id<'variant'>>().primaryKey(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
  experimentId: text('experiment_id').references(() => experimentsTable.id),
  daytonaSandboxId: text('daytona_sandbox_id').notNull(),
  publicUrl: text('public_url').notNull(),
  type: text('type').$type<'control' | 'experiment'>().notNull(),
  suggestion: text('suggestion'), // The UX improvement suggestion this variant is testing
  analysis: jsonb('analysis').$type<{
    success: boolean;
    summary: string;
    insights: string[];
    issues: string[];
  }>(),
});

export type VariantEntity = typeof variantsTable.$inferSelect;
