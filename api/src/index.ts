import { experimentRoutes } from '@/service/experiment/Experiment.service';
import { codeAgentRoutes } from '@/service/codeAgent/CodeAgent.service';
import { variantRoutes } from '@/service/variant/Variant.service';
import { agentRoutes } from '@/service/agent/Agent.service';
import { Elysia } from 'elysia';
import { logger } from '@bogeychan/elysia-logger';
import { inngestHandler } from '@/lib/inngest';
import cors from '@elysiajs/cors';

const port = 8000;

const app = new Elysia()
  .use(
    logger({
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      },
    })
  )
  .get('/', () => 'Hello World')
  .use(
    cors({
      origin: true, // Allow all origins in development
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
      ],
      preflight: true,
    })
  )
  .get('/health', () => 'OK')
  .use(experimentRoutes)
  .use(variantRoutes)
  .use(agentRoutes)
  .use(codeAgentRoutes)
  .use(inngestHandler)
  .listen(port, ({ hostname, port }) => {
    console.log(`🦊 API is running at ${hostname}:${port}`);
  });
