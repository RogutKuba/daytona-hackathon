# Autonomous UX Experimentation

> AI agents that find UX problems, write code to fix them, and test the results - automatically.

**Daytona Hacksprint 2025**

## What It Does

Give it a GitHub repo and a UX problem. The system will:
1. Test your site with **browser-use** agents
2. Generate improvement suggestions with AI
3. Implement fixes using **Claude Code** in **Daytona** sandboxes
4. Test each variant automatically
5. Show you live previews of all versions

Traditional A/B testing takes weeks. This takes minutes.

## How It Works

### The Three-Agent System

**1. Browser-use: Find the Problems**
```javascript
// Browser agents explore your site like real users
const task = "Browse the site trying to find products by category and price"
// Agent clicks around, scrolls, tries features
// Logs everything: "Can't find search bar", "No filter options visible"
```

**2. Daytona: Isolate the Work**
```javascript
// Create isolated sandbox for each variant
const sandbox = await daytona.create({
  repository: "your-repo",
  branch: "main"
})
// Each experiment gets its own environment
// No conflicts, no mess
```

**3. Claude Code: Write the Fix**
```javascript
// Claude Code implements improvements autonomously
const prompt = `
Repository is in /workspace
Add a product filter sidebar with:
- Price range slider
- Category checkboxes
- Size options
Report back which files you modified.
`
// Claude reads the codebase, makes changes, tests it
// All without human intervention
```

### The Full Workflow

```
You: "Users can't find products easily"
  ↓
Browser Agent: Tests site → finds issues
  ↓
AI: Generates 3-5 improvement ideas
  ↓
For each idea:
  → Daytona: Creates new sandbox
  → Claude Code: Implements the fix
  → Browser Agent: Tests the variant
  ↓
You: Review results → deploy winner
```

## Key Technical Details

### Daytona Integration
- **Parallel sandboxes**: Each variant runs in its own Daytona environment
- **Fast setup**: Clone repo → install deps → start dev server in ~2 minutes
- **Public URLs**: Every sandbox gets a preview link for testing
- **PM2 process management**: Keeps dev servers running reliably

### Claude Code Integration
- **Autonomous implementation**: Reads codebase, makes surgical changes
- **Script injection**: Custom Node.js script runs in each sandbox
- **Webhook reporting**: Agent posts results back to API when done
- **Full audit trail**: Tracks which files modified and what changed

### Browser-use Integration
- **Natural exploration**: AI generates realistic user tasks, not rigid scripts
- **Log analysis**: Gemini AI extracts insights from browser sessions
- **Parallel testing**: Tests control + all variants simultaneously
- **Real behavior**: Clicks, scrolls, searches like actual users

## Tech Stack

**Core**: Next.js, Bun, Elysia, PostgreSQL, Inngest
**AI**: Claude Code Agent SDK, Browser-use SDK, Daytona SDK, Google Gemini

## Quick Start

```bash
# Backend
cd api
bun install
bun run db:push
bun run dev      # Port 3001
bun run inngest  # Separate terminal

# Frontend
cd web
npm install
npm run dev      # Port 3000
```

**Environment variables**: `DATABASE_URL`, `DAYTONA_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_AI_API_KEY`, `INNGEST_EVENT_KEY`

## Example Run

```
Input:
  Repo: github.com/example/ecommerce
  Goal: "Add product filtering"

System generates:
  ✓ Variant 1: Price filter sidebar
  ✓ Variant 2: Category dropdown
  ✓ Variant 3: Search with autocomplete

3 Daytona sandboxes created
3 Claude Code agents implementing
3 browser agents testing

Results in 5 minutes:
  - Variant 1: ✓ Works, users find products faster
  - Variant 2: ✗ Dropdown hard to find
  - Variant 3: ✓ Works, users love autocomplete

Deploy variants 1 + 3 → Done
```

## What I Built

### The Integration Challenge
Combined three complex SDKs into one autonomous workflow:
- **Daytona SDK** for isolated cloud environments
- **Claude Code SDK** for autonomous implementation
- **Browser-use SDK** for realistic testing

### The Innovation
Most A/B testing tools require manual coding for each variant. This is the first system that:
- Identifies problems autonomously
- Writes code autonomously
- Tests variants autonomously
- All in parallel, in isolated sandboxes

### The Architecture
- Backend job orchestration with Inngest
- Parallel variant implementation (5+ sandboxes at once)
- Real-time progress tracking
- Full audit trail of AI decisions

## Challenges Solved

1. **Daytona Process Management**: Got PM2 running reliably in sandboxes for long-running dev servers
2. **Claude Code Communication**: Built webhook system for agents to report results back
3. **Parallel Orchestration**: Coordinated multiple async jobs with proper state management
4. **Browser-use Analysis**: Structured Gemini AI to extract actionable insights from logs

## Future Ideas

- Auto-create GitHub PRs for winning variants
- Real user traffic integration
- Visual regression testing
- Performance metric tracking
- Multi-page user journey testing

---

Built by [Kuba Rogut](https://github.com/RogutKuba) | Powered by **Daytona** + **Claude Code** + **Browser-use**
