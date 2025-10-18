import { experimentsTable } from '@/db/experiment.db';
import { variantsTable } from '@/db/variant.db';
import { Id } from '@/lib/id';
import { pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const agentsTable = pgTable('agents', {
  id: text('id').$type<Id<'agent'>>().primaryKey(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
  experimentId: text('experiment_id')
    .references(() => experimentsTable.id)
    .notNull(),
  variantId: text('variant_id')
    .references(() => variantsTable.id)
    .notNull(),
  browserTaskId: text('browser_task_id').notNull(),
  browserLiveUrl: text('browser_live_url'),
  taskPrompt: text('task_prompt').notNull(),
  status: text('status')
    .$type<'pending' | 'running' | 'completed' | 'failed'>()
    .notNull()
    .default('pending'),
  result: jsonb('result').$type<{
    success: boolean;
    summary: string;
    insights: string;
    issues: string;
  }>(),
  rawLogs: text('raw_logs'),
});

export type AgentEntity = typeof agentsTable.$inferSelect;
