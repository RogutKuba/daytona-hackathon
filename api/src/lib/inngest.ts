import Elysia from 'elysia';
import { serve } from 'inngest/bun';
import { inngestClient } from './inngest-client';
import { INNGEST_FUNCTIONS } from './inngest-functions';

const handler = serve({
  client: inngestClient,
  functions: INNGEST_FUNCTIONS,
});

export const inngestHandler = new Elysia({
  name: 'inngest',
  prefix: '/inngest',
}).all('/', ({ request }) => handler(request), {
  parse: 'none',
});
