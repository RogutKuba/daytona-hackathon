import { db } from '@/lib/client';
import { agentsTable } from '@/db/agent.db';
import { eq } from 'drizzle-orm';
import Elysia, { t } from 'elysia';
import { Id } from '@/lib/id';

export const agentRoutes = new Elysia({ prefix: '/agent' })
  .get('/:id', ({ params }) => {
    return db
      .select()
      .from(agentsTable)
      .where(eq(agentsTable.id, params.id as Id<'agent'>))
      .limit(1);
  })
  .get('/variant/:variantId', ({ params }) => {
    return db
      .select()
      .from(agentsTable)
      .where(eq(agentsTable.variantId, params.variantId as Id<'variant'>))
      .limit(1);
  })
  .get('/experiment/:experimentId', ({ params }) => {
    return db
      .select()
      .from(agentsTable)
      .where(
        eq(agentsTable.experimentId, params.experimentId as Id<'experiment'>)
      );
  });

export abstract class AgentService {
  //
}
