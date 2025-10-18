import { ExperimentEntity, experimentsTable } from '@/db/experiment.db';
import { AgentEntity, agentsTable } from '@/db/agent.db';
import { inngestClient } from '@/lib/inngest-client';
import { ExperimentService } from '@/service/experiment/Experiment.service';
import { AiService } from '@/service/ai/Ai.service';
import { BrowserService } from '@/service/browser/Browser.service';
import { db } from '@/lib/client';
import { generateId, Id } from '@/lib/id';
import { eq } from 'drizzle-orm';
import { variantsTable } from '@/db/variant.db';

export interface ExperimentRunJobData {
  experiment: ExperimentEntity;
}

const EXPERIMENT_RUN_JOB_ID = 'run-experiment';

export const runExperimentJob = inngestClient.createFunction(
  { id: EXPERIMENT_RUN_JOB_ID },
  { event: 'experiment/run' },
  async ({ event, step }) => {
    const { experiment } = event.data as ExperimentRunJobData;

    //  init repository
    const sandboxResult = await step.run('init-repo', async () => {
      console.log(
        `Creating sandbox for experiment ${experiment.id} with repo ${experiment.repoUrl}`
      );

      return await ExperimentService.initRepository(
        experiment.repoUrl,
        experiment.id
      );
    });

    // we now have the repo running on the sandbox.previewUrl with the control variant ready
    // now we need to spawn a browser agent to test visit the control variant with a goal so we have its logs
    const agentResult = await step.run(
      'spawn-browser-agent',
      async (): Promise<{
        agentId: string;
        taskId: string;
        liveUrl: string | null;
      }> => {
        console.log(
          `Spawning browser agent for variant ${sandboxResult.variant.id}`
        );

        // Step 1: Generate the browser task prompt using AI
        const taskPrompt = await AiService.generateBrowserTaskPrompt(
          experiment.goal,
          sandboxResult.variant.publicUrl
        );
        console.log(`Generated task prompt: ${taskPrompt}`);

        // Step 2: Create the agent entity in database
        const agent: AgentEntity = {
          id: generateId('agent'),
          createdAt: new Date().toISOString(),
          experimentId: experiment.id,
          variantId: sandboxResult.variant.id,
          browserTaskId: '', // Will be updated after task creation
          browserLiveUrl: null,
          taskPrompt,
          status: 'pending',
          result: null,
          rawLogs: null,
        };

        await db.insert(agentsTable).values(agent);
        console.log(`Created agent entity: ${agent.id}`);

        // Step 3: Create browser automation task
        const browserTask = await BrowserService.createTask(
          taskPrompt,
          sandboxResult.variant.publicUrl
        );
        console.log(
          `Created browser task: ${browserTask.id}, Live URL: not-here`
        );

        // Update agent with browser task info
        await db
          .update(agentsTable)
          .set({
            browserTaskId: browserTask.id,
            browserLiveUrl: '',
            status: 'running',
          })
          .where(eq(agentsTable.id, agent.id));

        return {
          agentId: agent.id,
          taskId: browserTask.id,
          liveUrl: '',
        };
      }
    );

    // Step 4: Wait for browser task to complete and analyze results
    const analysisResult = await step.run('analyze-browser-results', async () => {
      console.log(`Waiting for browser task ${agentResult.taskId} to complete`);

      // Wait for task completion (max 5 minutes)
      const completedTask = await BrowserService.waitForTaskCompletion(
        agentResult.taskId,
        5 * 60 * 1000
      );
      console.log(
        `Browser task completed with status: ${completedTask.status}`
      );

      // Get task logs
      const rawLogs = await BrowserService.getTaskLogs(agentResult.taskId);
      console.log(`Retrieved task logs (${rawLogs.length} characters)`);

      // Analyze logs using AI
      const analysis = await AiService.analyzeBrowserLogs(
        rawLogs,
        experiment.goal
      );
      console.log(`Analysis: ${JSON.stringify(analysis, null, 2)}`);

      // Determine final status
      const finalStatus: 'completed' | 'failed' =
        completedTask.status === 'finished' ? 'completed' : 'failed';

      // Update agent with results
      await db
        .update(agentsTable)
        .set({
          status: finalStatus,
          result: analysis,
          rawLogs,
        })
        .where(eq(agentsTable.id, agentResult.agentId as Id<'agent'>));

      console.log(`Agent ${agentResult.agentId} updated with results`);

      // update the variant with the analyis
      await db
        .update(variantsTable)
        .set({
          analysis: analysis,
        })
        .where(eq(variantsTable.id, sandboxResult.variant.id));

      return {
        agentId: agentResult.agentId,
        analysis,
      };
    });

    // Step 5: Generate variant suggestions based on control test results
    const variantSuggestions = await step.run(
      'generate-variant-suggestions',
      async () => {
        console.log(
          'Generating variant suggestions based on control test analysis'
        );

        // Generate UX improvement suggestions using AI
        const suggestions = await AiService.generateExperimentVariants(
          {
            success: analysisResult.analysis.success,
            summary: analysisResult.analysis.summary,
            insights: analysisResult.analysis.insights,
          },
          experiment.goal
        );

        console.log(
          `Generated ${suggestions.length} variant suggestions: ${JSON.stringify(suggestions, null, 2)}`
        );

        // Store the suggestions in the experiment
        await db
          .update(experimentsTable)
          .set({
            variantSuggestions: suggestions,
          })
          .where(eq(experimentsTable.id, experiment.id));

        console.log(
          `Stored variant suggestions for experiment ${experiment.id}`
        );

        return suggestions;
      }
    );

    console.log(
      `Experiment ${experiment.id} completed control test. Generated ${variantSuggestions.length} variant suggestions to test.`
    );

    // Step 6: Trigger variant implementation for each suggestion
    await step.run('trigger-variant-implementations', async () => {
      console.log(
        `Triggering ${variantSuggestions.length} variant implementations`
      );

      // Trigger a separate job for each variant implementation
      // These will run in parallel, each in its own sandbox
      for (const suggestion of variantSuggestions) {
        await inngestClient.send({
          name: 'variant/implement',
          data: {
            experimentId: experiment.id,
            suggestion,
            repoUrl: experiment.repoUrl,
            goal: experiment.goal,
          },
        });

        console.log(`Triggered variant implementation: ${suggestion}`);
      }

      console.log(
        `All ${variantSuggestions.length} variant implementations triggered`
      );
    });

    // The experiment job is complete
    // Each variant implementation will:
    // 1. Create a new sandbox
    // 2. Spawn Claude Code to implement the suggestion
    // 3. Start dev server
    // 4. Be ready for browser agent testing
  }
);

export const createExperimentJob = async (data: ExperimentRunJobData) => {
  await inngestClient.send({
    name: EXPERIMENT_RUN_JOB_ID,
    data: data,
  });
};
