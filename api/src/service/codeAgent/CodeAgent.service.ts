import { CodeAgentEntity, codeAgentsTable } from '@/db/codeAgent.db';
import { daytona } from '@/lib/daytona';
import { db } from '@/lib/client';
import { generateId, Id } from '@/lib/id';
import { eq } from 'drizzle-orm';
import Elysia, { t } from 'elysia';

export const codeAgentRoutes = new Elysia({ prefix: '/code-agent' })
  .get('/:id', ({ params }) => {
    return db
      .select()
      .from(codeAgentsTable)
      .where(eq(codeAgentsTable.id, params.id as Id<'codeAgent'>))
      .limit(1);
  })
  .get('/experiment/:experimentId', ({ params }) => {
    return db
      .select()
      .from(codeAgentsTable)
      .where(
        eq(
          codeAgentsTable.experimentId,
          params.experimentId as Id<'experiment'>
        )
      );
  });

export abstract class CodeAgentService {
  static WORK_DIR = 'workspace/commerce';

  /**
   * Create a code agent entity in the database
   */
  static async createCodeAgent(data: {
    experimentId: Id<'experiment'>;
    variantId: Id<'variant'>;
    daytonaSandboxId: string;
    suggestion: string;
    implementationPrompt: string;
  }): Promise<CodeAgentEntity> {
    const codeAgent: CodeAgentEntity = {
      id: generateId('codeAgent'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      experimentId: data.experimentId,
      variantId: data.variantId,
      daytonaSandboxId: data.daytonaSandboxId,
      claudeSessionId: null,
      suggestion: data.suggestion,
      implementationPrompt: data.implementationPrompt,
      status: 'pending',
      implementationSummary: null,
      filesModified: null,
      codeChanges: null,
      logs: null,
      errorMessage: null,
      startedAt: null,
      completedAt: null,
    };

    await db.insert(codeAgentsTable).values(codeAgent);
    return codeAgent;
  }

  /**
   * Update code agent status
   */
  static async updateStatus(
    codeAgentId: Id<'codeAgent'>,
    status: 'pending' | 'running' | 'completed' | 'failed',
    data?: {
      startedAt?: string;
      completedAt?: string;
      errorMessage?: string;
    }
  ) {
    return db
      .update(codeAgentsTable)
      .set({
        status,
        updatedAt: new Date().toISOString(),
        ...data,
      })
      .where(eq(codeAgentsTable.id, codeAgentId));
  }

  /**
   * Update code agent with implementation results
   */
  static async updateResults(
    codeAgentId: Id<'codeAgent'>,
    results: {
      implementationSummary: string;
      filesModified: string[];
      codeChanges: { file: string; changes: string }[];
      logs: string;
    }
  ) {
    return db
      .update(codeAgentsTable)
      .set({
        status: 'completed',
        implementationSummary: results.implementationSummary,
        filesModified: results.filesModified,
        codeChanges: results.codeChanges,
        logs: results.logs,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(codeAgentsTable.id, codeAgentId));
  }

  /**
   * Clone a sandbox to create a new variant
   * Creates a new Daytona sandbox by cloning the repo and setting it up
   */
  static async createVariantSandbox(
    repoUrl: string,
    experimentId: Id<'experiment'>,
    suggestion: string
  ) {
    // Create a new sandbox
    const sandbox = await daytona.create({
      language: 'typescript',
      public: true,
      envVars: {
        NODE_ENV: 'development',
        EXPERIMENT_ID: experimentId,
        VARIANT_TYPE: 'experiment',
      },
    });

    // Clone the repository
    await sandbox.git.clone(repoUrl, CodeAgentService.WORK_DIR);

    // Install pm2 for process management
    await sandbox.process.executeCommand(`npm install -g pm2`);

    // Install dependencies
    await sandbox.process.executeCommand(
      `npm install`,
      CodeAgentService.WORK_DIR
    );

    return {
      sandboxId: sandbox.id,
      sandbox,
    };
  }

  /**
   * Spawn a Claude Code agent in the sandbox to implement changes
   * This method would integrate with Claude Code API/SDK when available
   */
  static async spawnClaudeCodeAgent(
    sandboxId: string,
    suggestion: string,
    goal: string
  ): Promise<{
    claudeSessionId: string;
    implementationPrompt: string;
  }> {
    // Generate the implementation prompt for Claude
    const implementationPrompt = CodeAgentService.generateImplementationPrompt(
      suggestion,
      goal
    );

    // TODO: Integrate with Claude Code API to spawn agent in sandbox
    // For now, we'll return a placeholder
    // In production, this would:
    // 1. Initialize a Claude Code session in the Daytona sandbox
    // 2. Send the implementation prompt
    // 3. Monitor progress
    // 4. Return the session ID

    const claudeSessionId = `claude-session-${Date.now()}`;

    return {
      claudeSessionId,
      implementationPrompt,
    };
  }

  /**
   * Generate the implementation prompt for Claude Code agent
   */
  static generateImplementationPrompt(
    suggestion: string,
    goal: string
  ): string {
    return `You are a senior software engineer tasked with implementing a UX improvement to address user feedback.

**Original User Issue:**
${goal}

**Suggested UX Improvement:**
${suggestion}

**Your Task:**
Implement this UX improvement in the codebase. The project is a Next.js e-commerce application located in the workspace/commerce directory.

**Instructions:**
1. Analyze the current codebase to understand the existing structure
2. Implement the suggested improvement following React/Next.js best practices
3. Ensure the implementation is clean, maintainable, and follows the existing code style
4. Test that the changes work correctly by starting the dev server
5. Provide a summary of what you implemented and which files you modified

**Important:**
- Make only the changes necessary to implement this specific improvement
- Don't refactor unrelated code
- Ensure the application still runs correctly after your changes
- Use TypeScript if the codebase uses it

Please implement this improvement now.`;
  }

  /**
   * Start the dev server in the variant sandbox
   */
  static async startVariantServer(sandboxId: string) {
    const sandbox = await daytona.get(sandboxId);

    // Start dev server with pm2
    await sandbox.process.executeCommand(
      `pm2 start npm --name "variant-dev-server" -- run dev`,
      CodeAgentService.WORK_DIR
    );

    // Wait for server to start
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Get preview URL
    const previewUrl = await sandbox.getPreviewLink(3000);

    return {
      previewUrl: previewUrl.url,
    };
  }

  /**
   * Monitor Claude Code agent progress
   * This would poll the Claude Code API to check on progress
   */
  static async monitorClaudeProgress(claudeSessionId: string): Promise<{
    status: 'running' | 'completed' | 'failed';
    summary?: string;
    filesModified?: string[];
    logs?: string;
    error?: string;
  }> {
    // TODO: Implement actual Claude Code API monitoring
    // For now, return a placeholder
    return {
      status: 'completed',
      summary: 'Implementation completed successfully',
      filesModified: ['src/components/FilterSidebar.tsx'],
      logs: 'Claude implementation logs would go here',
    };
  }
}
