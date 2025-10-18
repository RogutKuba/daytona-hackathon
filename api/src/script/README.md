# Claude Code Agent Script

## Overview

This directory contains the script template for running Claude Code agents inside Daytona sandboxes. The script uses the Claude Agent SDK in single-shot mode to autonomously implement UX improvements.

## How It Works

### Architecture

```
┌─────────────────┐
│  Experiment Job │
│   (Inngest)     │
└────────┬────────┘
         │
         │ 1. Generate script from template
         │ 2. Write to sandbox
         │ 3. Install Claude Agent SDK
         │ 4. Execute script in background
         │
         ▼
┌─────────────────┐
│ Daytona Sandbox │
│                 │
│  ┌───────────┐  │
│  │  Script   │  │ ← run-claude-code.js
│  │  Running  │  │
│  └─────┬─────┘  │
│        │        │
│        │ Uses Claude Agent SDK
│        │ to implement changes
│        │
│  ┌─────▼─────┐  │
│  │  Claude   │  │
│  │  Code     │  │
│  │  Agent    │  │
│  └─────┬─────┘  │
│        │        │
│        │ Modifies files
│        │ Runs tools
│        │
│  ┌─────▼─────┐  │
│  │ workspace/│  │
│  │ commerce/ │  │
│  └───────────┘  │
└────────┬────────┘
         │
         │ POST results
         │
         ▼
┌─────────────────┐
│   API Endpoint  │
│ /code-agent/    │
│   :id/results   │
└─────────────────┘
```

### Flow

1. **Script Generation**
   - API reads `run-claude-code.template.js`
   - Replaces placeholders with actual values:
     - `{{CODE_AGENT_ID}}` - Database ID for tracking
     - `{{API_URL}}` - Where to POST results
     - `{{API_KEY}}` - Authentication
     - `{{WORK_DIR}}` - Working directory (workspace/commerce)
     - `{{IMPLEMENTATION_PROMPT}}` - Claude's instructions

2. **Script Deployment**
   - Write generated script to `/tmp/run-claude-code.js` in sandbox
   - Install Claude Agent SDK: `npm install -g @anthropic-ai/claude-agent-sdk`
   - Execute in background: `nohup node /tmp/run-claude-code.js &`

3. **Claude Execution**
   - Script initializes Claude Agent SDK
   - Runs Claude in single-shot mode with:
     - Max 20 turns
     - Tools: Read, Write, Edit, Bash, Glob, Grep
     - Working directory: workspace/commerce
   - Claude autonomously implements the UX improvement

4. **Progress Tracking**
   - Script monitors Claude's tool usage
   - Tracks which files are modified (Write/Edit tools)
   - Collects all messages and logs

5. **Results Reporting**
   - On completion: POST success to API with:
     - Implementation summary
     - Files modified
     - Full logs
   - On failure: POST error details
   - API updates database via `POST /code-agent/:id/results`

6. **Monitoring**
   - Job polls database every 5 seconds
   - Waits for script to update code agent status
   - Times out after 10 minutes if not complete

## Template Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{{CODE_AGENT_ID}}` | Code agent database ID | `ca_abc123` |
| `{{API_URL}}` | API base URL | `http://api.example.com` |
| `{{API_KEY}}` | Auth token for API | `internal-api-key` |
| `{{WORK_DIR}}` | Working directory | `workspace/commerce` |
| `{{IMPLEMENTATION_PROMPT}}` | Instructions for Claude | Full prompt text |

## Script Capabilities

The script running in the sandbox:

### ✅ Can Do
- Read any file in the workspace
- Write new files
- Edit existing files
- Run bash commands
- Search files with glob patterns
- Grep for content
- Install npm packages
- Modify code
- Create new components/files
- Test changes by running dev server

### ❌ Cannot Do
- Access files outside workspace
- Make network requests (except to API endpoint)
- Access host machine
- Modify Daytona sandbox itself

## API Endpoint

### POST `/code-agent/:id/results`

Updates the code agent with results from the script.

**Request Body:**
```typescript
{
  status?: 'running' | 'completed' | 'failed',
  startedAt?: string,
  completedAt?: string,
  implementationSummary?: string,
  filesModified?: string[],
  codeChanges?: { file: string, changes: string }[],
  logs?: string,
  errorMessage?: string
}
```

**Response:**
```typescript
{
  success: boolean
}
```

## Environment Variables

Required environment variables:

```bash
# API URL where script will POST results
API_URL=http://localhost:8000

# API key for authentication
API_KEY=your-secret-key

# Anthropic API key (used by Claude Agent SDK)
ANTHROPIC_API_KEY=sk-ant-...
```

## Example Implementation Prompt

```
You are a senior software engineer tasked with implementing a UX improvement to address user feedback.

**Original User Issue:**
Users complaining about not finding products easily or being able to filter them

**Suggested UX Improvement:**
Add a sticky filter sidebar on the left with collapsible sections for price range, category, color, and size

**Your Task:**
Implement this UX improvement in the codebase. The project is a Next.js e-commerce application located in the workspace/commerce directory.

**Instructions:**
1. Analyze the current codebase to understand the existing structure
2. Implement the suggested improvement following React/Next.js best practices
3. Ensure the implementation is clean, maintainable, and follows the existing code style
4. Test that the changes work correctly by starting the dev server
5. Provide a summary of what you implemented and which files you modified

Please implement this improvement now.
```

## Logs

### Script Output

The script logs to `/tmp/claude-code-output.log` in the sandbox:

```
=== Claude Code Agent Starting ===
Code Agent ID: ca_abc123
Working Directory: workspace/commerce
Prompt: You are a senior software engineer...

Running Claude Code agent...
Tool used: Read
Tool used: Grep
Tool used: Write
Assistant thinking...
Tool used: Edit
Claude completed task

=== Execution Complete ===
Duration: 127.3s
Files Modified: 3
Files: src/components/FilterSidebar.tsx, src/app/page.tsx, src/styles/filters.css

Results reported successfully
```

### API Logs

Job logs show progress:

```
Spawning Claude Code agent in sandbox sb_xyz789
Writing Claude Code script to sandbox...
Installing Claude Agent SDK...
Starting Claude Code agent...
Claude session initiated: claude-session-ca_abc123-1234567890
Monitoring Claude Code agent: ca_abc123
Waiting for Claude Code script to complete...
Implementation completed: Added filter sidebar with price, category, color, and size filters
Files modified: src/components/FilterSidebar.tsx, src/app/page.tsx, src/styles/filters.css
```

## Debugging

### Check Script Status

SSH into the Daytona sandbox and check:

```bash
# Check if script is running
ps aux | grep run-claude-code

# View logs
tail -f /tmp/claude-code-output.log

# Check if Claude Agent SDK is installed
npm list -g @anthropic-ai/claude-agent-sdk
```

### Common Issues

**Script fails to start:**
- Check if Claude Agent SDK installed: `npm list -g @anthropic-ai/claude-agent-sdk`
- Check script exists: `cat /tmp/run-claude-code.js`
- Check logs: `cat /tmp/claude-code-output.log`

**No results posted:**
- Verify API_URL is accessible from sandbox
- Check API_KEY is correct
- Verify network connectivity

**Timeout:**
- Check if Claude is stuck (increase max_turns)
- Verify prompt is clear and actionable
- Check if tools are working correctly

## Performance

Typical execution times:

- **Simple changes** (1-2 files): 30-60 seconds
- **Medium complexity** (3-5 files): 1-3 minutes
- **Complex changes** (>5 files): 3-10 minutes

The 10-minute timeout provides buffer for complex implementations.

## Security

- Script runs in isolated Daytona sandbox
- Cannot access host machine
- Can only modify files in workspace
- API authentication required for results posting
- No access to sensitive environment variables beyond what's needed
