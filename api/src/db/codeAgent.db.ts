import { experimentsTable } from '@/db/experiment.db';
import { variantsTable } from '@/db/variant.db';
import { Id } from '@/lib/id';
import { pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const codeAgentsTable = pgTable('code_agents', {
  id: text('id').$type<Id<'codeAgent'>>().primaryKey(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow(),

  // Relations
  experimentId: text('experiment_id')
    .references(() => experimentsTable.id)
    .notNull(),
  variantId: text('variant_id')
    .references(() => variantsTable.id)
    .notNull(),

  // Claude Code Agent Details
  claudeSessionId: text('claude_session_id'), // Claude Code session identifier
  daytonaSandboxId: text('daytona_sandbox_id').notNull(), // Sandbox where Claude is working

  // Task Information
  suggestion: text('suggestion').notNull(), // The UX improvement to implement
  implementationPrompt: text('implementation_prompt').notNull(), // Full prompt given to Claude

  // Status Tracking
  status: text('status')
    .$type<'pending' | 'running' | 'completed' | 'failed'>()
    .notNull()
    .default('pending'),

  // Results
  implementationSummary: text('implementation_summary'), // Summary of what Claude did
  filesModified: jsonb('files_modified').$type<string[]>(), // List of files changed
  codeChanges: jsonb('code_changes').$type<
    {
      file: string;
      changes: string;
    }[]
  >(), // Detailed code changes
  logs: text('logs'), // Full logs from Claude session
  errorMessage: text('error_message'), // Error message if failed

  // Timing
  startedAt: timestamp('started_at', { mode: 'string' }),
  completedAt: timestamp('completed_at', { mode: 'string' }),
});

export type CodeAgentEntity = typeof codeAgentsTable.$inferSelect;
