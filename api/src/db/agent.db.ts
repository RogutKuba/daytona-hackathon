import { experimentsTable } from '@/db/experiment.db';
import { Id } from '@/lib/id';
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const agentsTable = pgTable('agents', {
  id: text('id').$type<Id<'agent'>>().primaryKey(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
  experimentId: text('experiment_id').references(() => experimentsTable.id),
  daytonaSandboxId: text('daytona_sandbox_id').notNull(),
  publicUrl: text('public_url').notNull(),
  goal: text('goal').notNull(),
});
