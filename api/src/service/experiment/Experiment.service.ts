import { ExperimentEntity, experimentsTable } from '@/db/experiment.db';
import { db } from '@/lib/client';
import { generateId, Id } from '@/lib/id';
import { daytona } from '@/lib/daytona';
import { desc, eq } from 'drizzle-orm';
import Elysia, { t } from 'elysia';
import { inngestClient } from '@/lib/inngest-client';
import { VariantEntity, variantsTable } from '@/db/variant.db';

export const experimentRoutes = new Elysia({ prefix: '/experiment' })
  .get('/', () => {
    console.log('get all experiments');
    // return all experiments
    return db
      .select()
      .from(experimentsTable)
      .orderBy(desc(experimentsTable.createdAt))
      .limit(10);
  })
  .get(
    '/:id',
    ({ params }) => {
      return db
        .select()
        .from(experimentsTable)
        .where(eq(experimentsTable.id, params.id as Id<'experiment'>))
        .limit(1);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  .post(
    '/',
    async ({ body }) => {
      const newExperiment: ExperimentEntity = {
        id: generateId('experiment'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        repoUrl: body.repoUrl,
        goal: body.goal,
        status: 'pending',
        variantSuggestions: [],
      };

      await db.insert(experimentsTable).values(newExperiment);

      // kick off workflow for expermintation
      await inngestClient.send({
        name: 'experiment/run',
        data: { experiment: newExperiment },
      });

      return newExperiment;
    },
    {
      body: t.Object({
        repoUrl: t.String(),
        goal: t.String(),
      }),
    }
  );

export abstract class ExperimentService {
  static WORK_DIR = 'workspace/commerce';

  /**
   * This creates sandbox, clones repo, installs dependencies, and starts dev server
   */
  static async initRepository(repoUrl: string, experimentId: Id<'experiment'>) {
    let start = Date.now();
    let end = Date.now();

    start = Date.now();
    const sandbox = await daytona.create({
      language: 'typescript',
      public: true,
      envVars: {
        NODE_ENV: 'development',
      },
    });
    end = Date.now();
    console.log(`Time taken to create sandbox: ${end - start}ms`);

    // Clone the repository into the sandbox
    start = Date.now();
    await sandbox.git.clone(repoUrl, ExperimentService.WORK_DIR);
    end = Date.now();
    console.log(`Time taken to clone repository: ${end - start}ms`);

    // Install pm2
    const pm2InstallResult = await sandbox.process.executeCommand(
      `npm install -g pm2`
    );
    console.log(
      `PM2 install result: ${JSON.stringify(pm2InstallResult, null, 2)}`
    );

    // Install dependencies
    start = Date.now();
    await sandbox.process.executeCommand(
      `npm install`,
      ExperimentService.WORK_DIR
    );
    end = Date.now();
    console.log(`Time taken to install dependencies: ${end - start}ms`);

    // print out the current directory
    const cwdLs = await sandbox.process.executeCommand(
      `ls`,
      ExperimentService.WORK_DIR
    );
    console.log(`Current directory ls: ${JSON.stringify(cwdLs, null, 2)}`);

    start = Date.now();
    // Start the development server
    const codeRunResult = await sandbox.process.executeCommand(
      `pm2 start npm --name "vite-dev-server" -- run dev`,
      ExperimentService.WORK_DIR
    );
    end = Date.now();
    console.log(`Time taken to execucte npm run dev: ${end - start}ms`);
    console.log(`Code run result: ${JSON.stringify(codeRunResult, null, 2)}`);

    await new Promise((resolve) => setTimeout(resolve, 3000));
    console.log('Dev server should be running now');

    start = Date.now();
    const previewUrl = await sandbox.getPreviewLink(3000);
    end = Date.now();
    console.log(`Time taken to get preview link: ${end - start}ms`);

    // insert to db
    const newVariant: VariantEntity = {
      id: generateId('variant'),
      createdAt: new Date().toISOString(),
      experimentId: experimentId,
      daytonaSandboxId: sandbox.id,
      publicUrl: previewUrl.url,
      type: 'control',
      suggestion: null, // Control variant has no suggestion - it's the baseline
      analysis: null,
    };

    await db.insert(variantsTable).values(newVariant);

    return {
      sandbox: {
        ...sandbox,
        previewUrl: previewUrl.url,
      },
      variant: newVariant,
    };
  }
}
