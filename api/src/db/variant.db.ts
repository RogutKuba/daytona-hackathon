import { Id } from '@/lib/id';
import { text, pgTable, timestamp } from 'drizzle-orm/pg-core';
import { experimentsTable } from './experiment.db';

export const variantsTable = pgTable('variants', {
  id: text('id').$type<Id<'variant'>>().primaryKey(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
  experimentId: text('experiment_id').references(() => experimentsTable.id),
  daytonaSandboxId: text('daytona_sandbox_id').notNull(),
  publicUrl: text('public_url').notNull(),
});

export type VariantEntity = typeof variantsTable.$inferSelect;
