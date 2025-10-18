import { CodeAgentEntity, codeAgentsTable } from '@/db/codeAgent.db';
import { daytona } from '@/lib/daytona';
import { db } from '@/lib/client';
import { generateId, Id } from '@/lib/id';
import { eq } from 'drizzle-orm';
import Elysia, { t } from 'elysia';
import { env } from '@/lib/env';

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
  })
  .post(
    '/:id/results',
    async ({ params, body }) => {
      const codeAgentId = params.id as Id<'codeAgent'>;

      console.log(
        `Updating code agent ${codeAgentId} with results: ${JSON.stringify(
          body,
          null,
          2
        )}`
      );

      // Update the code agent with results from the Claude Code script
      await db
        .update(codeAgentsTable)
        .set({
          ...body,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(codeAgentsTable.id, codeAgentId));

      return { success: true };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        status: t.Optional(
          t.Union([
            t.Literal('running'),
            t.Literal('completed'),
            t.Literal('failed'),
          ])
        ),
        startedAt: t.Optional(t.String()),
        completedAt: t.Optional(t.String()),
        implementationSummary: t.Optional(t.String()),
        filesModified: t.Optional(t.Array(t.String())),
        codeChanges: t.Optional(
          t.Array(
            t.Object({
              file: t.String(),
              changes: t.String(),
            })
          )
        ),
        logs: t.Optional(t.String()),
        errorMessage: t.Optional(t.String()),
      }),
    }
  );

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
        ANTHROPIC_API_KEY: env.ANTHROPIC_API_KEY,
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

    // ANTHROPIC_API_KEY is now set via envVars when creating the sandbox

    // start dev server
    await sandbox.process.executeCommand(
      `pm2 start npm --name "variant-dev-server" -- run dev`,
      CodeAgentService.WORK_DIR
    );

    const previewUrl = await sandbox.getPreviewLink(3000);
    console.log(`Preview URL: ${previewUrl.url}`);

    return {
      sandboxId: sandbox.id,
      sandbox,
      previewUrl: previewUrl.url,
    };
  }

  /**
   * Spawn a Claude Code agent in the sandbox to implement changes
   * Uses the Claude Agent SDK in single-shot mode
   */
  static async spawnClaudeCodeAgent(
    sandboxId: string,
    codeAgentId: Id<'codeAgent'>,
    suggestion: string,
    goal: string,
    apiUrl: string
  ): Promise<{
    claudeSessionId: string;
    implementationPrompt: string;
  }> {
    const sandbox = await daytona.get(sandboxId);

    // Generate the implementation prompt for Claude
    const implementationPrompt = CodeAgentService.generateImplementationPrompt(
      suggestion,
      goal
    );

    // Check if ANTHROPIC_API_KEY is available in the sandbox
    const envCheck = await sandbox.process.executeCommand(
      `echo "ANTHROPIC_API_KEY is: $ANTHROPIC_API_KEY"`,
      CodeAgentService.WORK_DIR
    );
    console.log(`Environment check result:`, envCheck);

    // Read the script template
    const fs = await import('fs/promises');
    const path = await import('path');
    const templatePath = path.join(
      process.cwd(),
      'src/script/run-claude-code.template.js'
    );
    let scriptContent = await fs.readFile(templatePath, 'utf-8');

    // Replace placeholders in the template
    scriptContent = scriptContent
      .replace('{{CODE_AGENT_ID}}', codeAgentId)
      .replace('{{API_URL}}', apiUrl)
      .replace(
        '{{IMPLEMENTATION_PROMPT}}',
        implementationPrompt.replace(/`/g, '\\`').replace(/\$/g, '\\$')
      );

    console.log('Writing Claude Code script to sandbox...');

    // Write the script to the sandbox
    const scriptPath = 'script.js';

    // Write the script content to the file using a heredoc approach
    // This handles quotes, newlines, and special characters properly
    const writeCommand = `cat > ${scriptPath} << 'EOF'
${scriptContent}
EOF`;

    const writeResult = await sandbox.process.executeCommand(
      writeCommand,
      CodeAgentService.WORK_DIR
    );
    console.log(
      `used-write-command`,
      `cat > ${scriptPath} << 'EOF' ... EOF\n\n`,
      writeResult
    );

    console.log('Installing Claude Agent SDK...');

    // Install the Claude Agent SDK in the sandbox
    await sandbox.process.executeCommand(
      'npm install -g @anthropic-ai/claude-agent-sdk',
      CodeAgentService.WORK_DIR
    );

    console.log('Starting Claude Code agent...');

    // Execute the script using PM2 for better process management
    // The script will report results back to the API via POST /code-agent/:id/results
    const executeResult = await sandbox.process.executeCommand(
      `ANTHROPIC_API_KEY=${env.ANTHROPIC_API_KEY} pm2 start ${scriptPath} --name "claude-code-${codeAgentId}" --no-autorestart`,
      CodeAgentService.WORK_DIR
    );

    console.log(
      `claude-code execution result: ${JSON.stringify(executeResult, null, 2)}`
    );
    console.log('Claude Code agent started');

    const claudeSessionId = `claude-session-${codeAgentId}-${Date.now()}`;

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
   * Monitor Claude Code agent progress
   * Polls the database to check if the script has updated the code agent
   */
  static async monitorClaudeProgress(
    codeAgentId: Id<'codeAgent'>,
    maxWaitTime: number
  ): Promise<{
    status: 'running' | 'completed' | 'failed';
    summary?: string;
    filesModified?: string[];
    logs?: string;
    error?: string;
  }> {
    const startTime = Date.now();
    const pollInterval = 5000; // Poll every 5 seconds

    while (Date.now() - startTime < maxWaitTime) {
      // Query the database for the code agent
      const codeAgent = await db
        .select()
        .from(codeAgentsTable)
        .where(eq(codeAgentsTable.id, codeAgentId))
        .limit(1);

      if (codeAgent.length === 0) {
        throw new Error(`Code agent ${codeAgentId} not found`);
      }

      const agent = codeAgent[0];

      // Check if the agent has completed or failed
      if (agent.status === 'completed') {
        return {
          status: 'completed',
          summary: agent.implementationSummary || 'Implementation completed',
          filesModified: (agent.filesModified as string[]) || [],
          logs: agent.logs || '',
        };
      } else if (agent.status === 'failed') {
        return {
          status: 'failed',
          error: agent.errorMessage || 'Implementation failed',
          logs: agent.logs || '',
        };
      }

      // Still running, wait before polling again
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    // Timeout
    throw new Error(
      `Code agent ${codeAgentId} did not complete within ${maxWaitTime}ms`
    );
  }
}
