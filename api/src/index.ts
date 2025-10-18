import { experimentRoutes } from '@/service/experiment/Experiment.service';
import { Elysia } from 'elysia';
import { logger } from '@bogeychan/elysia-logger';
import { inngestHandler } from '@/lib/inngest';

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
  .get('/health', () => 'OK')
  .use(experimentRoutes)
  .use(inngestHandler)
  .listen(port, ({ hostname, port }) => {
    console.log(`🦊 API is running at ${hostname}:${port}`);
  });
