import { ExperimentEntity } from '@/db/experiment.db';
import { VariantEntity, variantsTable } from '@/db/variant.db';
import { CodeAgentEntity, codeAgentsTable } from '@/db/codeAgent.db';
import { inngestClient } from '@/lib/inngest-client';
import { CodeAgentService } from '@/service/codeAgent/CodeAgent.service';
import { db } from '@/lib/client';
import { generateId, Id } from '@/lib/id';
import { eq } from 'drizzle-orm';

export interface ImplementVariantJobData {
  experimentId: Id<'experiment'>;
  suggestion: string;
  repoUrl: string;
  goal: string;
}

const IMPLEMENT_VARIANT_JOB_ID = 'implement-variant';

export const implementVariantJob = inngestClient.createFunction(
  { id: IMPLEMENT_VARIANT_JOB_ID, concurrency: 3 },
  { event: 'variant/implement' },
  async ({ event, step }) => {
    const { experimentId, suggestion, repoUrl, goal } =
      event.data as ImplementVariantJobData;

    console.log(
      `Starting variant implementation for experiment ${experimentId}: ${suggestion}`
    );

    // Step 1: Create new sandbox for variant
    const sandboxResult = await step.run(
      'create-variant-sandbox',
      async () => {
        console.log(`Creating variant sandbox for experiment ${experimentId}`);

        const result = await CodeAgentService.createVariantSandbox(
          repoUrl,
          experimentId,
          suggestion
        );

        console.log(`Variant sandbox created: ${result.sandboxId}`);
        return result;
      }
    );

    // Step 2: Create variant entity in database
    const variant = await step.run('create-variant-entity', async () => {
      console.log('Creating variant entity in database');

      const newVariant: VariantEntity = {
        id: generateId('variant'),
        createdAt: new Date().toISOString(),
        experimentId,
        daytonaSandboxId: sandboxResult.sandboxId,
        publicUrl: '', // Will be updated after dev server starts
        type: 'experiment',
        suggestion,
        analysis: null,
      };

      await db.insert(variantsTable).values(newVariant);

      console.log(`Variant entity created: ${newVariant.id}`);
      return newVariant;
    });

    // Step 3: Generate implementation prompt and create code agent
    const codeAgentResult = await step.run('create-code-agent', async () => {
      console.log('Generating implementation prompt for Claude Code');

      const implementationPrompt =
        CodeAgentService.generateImplementationPrompt(suggestion, goal);

      const codeAgent = await CodeAgentService.createCodeAgent({
        experimentId,
        variantId: variant.id,
        daytonaSandboxId: sandboxResult.sandboxId,
        suggestion,
        implementationPrompt,
      });

      console.log(`Code agent created: ${codeAgent.id}`);
      return {
        codeAgent,
        implementationPrompt,
      };
    });

    // Step 4: Spawn Claude Code agent to implement changes
    const claudeSession = await step.run('spawn-claude-agent', async () => {
      console.log(
        `Spawning Claude Code agent in sandbox ${sandboxResult.sandboxId}`
      );

      // Update code agent status to running
      await CodeAgentService.updateStatus(
        codeAgentResult.codeAgent.id,
        'running',
        {
          startedAt: new Date().toISOString(),
        }
      );

      const result = await CodeAgentService.spawnClaudeCodeAgent(
        sandboxResult.sandboxId,
        suggestion,
        goal
      );

      console.log(`Claude session initiated: ${result.claudeSessionId}`);
      return result;
    });

    // Step 5: Monitor Claude Code implementation
    const implementationResult = await step.run(
      'monitor-implementation',
      async () => {
        console.log(
          `Monitoring Claude Code progress: ${claudeSession.claudeSessionId}`
        );

        // TODO: Implement actual Claude Code API monitoring
        // For now, this is a placeholder that would poll Claude Code API
        const result = await CodeAgentService.monitorClaudeProgress(
          claudeSession.claudeSessionId
        );

        // Update code agent with results
        if (result.status === 'completed') {
          await CodeAgentService.updateResults(
            codeAgentResult.codeAgent.id,
            {
              implementationSummary:
                result.summary || 'Implementation completed',
              filesModified: result.filesModified || [],
              codeChanges: [],
              logs: result.logs || '',
            }
          );
        } else if (result.status === 'failed') {
          await CodeAgentService.updateStatus(
            codeAgentResult.codeAgent.id,
            'failed',
            {
              completedAt: new Date().toISOString(),
              errorMessage: result.error || 'Implementation failed',
            }
          );

          throw new Error(
            `Claude Code implementation failed: ${result.error}`
          );
        }

        console.log(`Implementation ${result.status}: ${result.summary}`);
        return result;
      }
    );

    // Step 6: Start development server and get preview URL
    const previewResult = await step.run('start-variant-server', async () => {
      console.log(
        `Starting development server in sandbox ${sandboxResult.sandboxId}`
      );

      const result = await CodeAgentService.startVariantServer(
        sandboxResult.sandboxId
      );

      console.log(`Dev server started, preview URL: ${result.previewUrl}`);
      return result;
    });

    // Step 7: Update variant with preview URL
    await step.run('update-variant-url', async () => {
      console.log(`Updating variant ${variant.id} with preview URL`);

      await db
        .update(variantsTable)
        .set({
          publicUrl: previewResult.previewUrl,
        })
        .where(eq(variantsTable.id, variant.id));

      console.log(`Variant ${variant.id} updated with URL`);
    });

    console.log(
      `Variant implementation completed for experiment ${experimentId}`
    );
    console.log(`Variant ID: ${variant.id}, URL: ${previewResult.previewUrl}`);

    return {
      variantId: variant.id,
      codeAgentId: codeAgentResult.codeAgent.id,
      sandboxId: sandboxResult.sandboxId,
      previewUrl: previewResult.previewUrl,
      suggestion,
    };

    // TODO: Next step would be to trigger browser agent test on this new variant
    // await inngestClient.send({
    //   name: 'agent/test-variant',
    //   data: { variantId: variant.id, goal, url: previewResult.previewUrl }
    // });
  }
);

/**
 * Helper function to trigger variant implementation
 */
export const triggerVariantImplementation = async (
  data: ImplementVariantJobData
) => {
  await inngestClient.send({
    name: 'variant/implement',
    data,
  });
};
