import { db } from '@/lib/client';
import { variantsTable } from '@/db/variant.db';
import { eq } from 'drizzle-orm';
import Elysia, { t } from 'elysia';
import { Id } from '@/lib/id';

export const variantRoutes = new Elysia({ prefix: '/variant' })
  .get('/:id', ({ params }) => {
    return db
      .select()
      .from(variantsTable)
      .where(eq(variantsTable.id, params.id as Id<'variant'>))
      .limit(1);
  })
  .get('/experiment/:experimentId', ({ params }) => {
    return db
      .select()
      .from(variantsTable)
      .where(
        eq(variantsTable.experimentId, params.experimentId as Id<'experiment'>)
      );
  });

export abstract class VariantService {
  //
}
