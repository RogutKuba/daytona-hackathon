# Database Schemas Documentation

## Overview

This directory contains all database entity definitions and schemas for the autonomous experimentation system. The schemas use Drizzle ORM with PostgreSQL and follow a hierarchical structure for A/B testing and code modifications.

## Schema Relationships

```
┌─────────────┐
│ Experiment  │  (Top-level entity)
└──────┬──────┘
       │
       │ has many
       │
       ▼
┌─────────────┐
│  Variants   │  (Control + Experimental variants)
└──────┬──────┘
       │
       ├───────────────┐
       │               │
       │ has one       │ has one
       │               │
       ▼               ▼
┌─────────────┐   ┌─────────────┐
│   Agent     │   │ CodeAgent   │
│ (Browser)   │   │  (Claude)   │
└─────────────┘   └─────────────┘
```

## Entity Lifecycle

```
1. Create Experiment
   └─> Goal: "Users can't find products easily"

2. Create Control Variant
   └─> Daytona sandbox with original code

3. Run Browser Agent on Control
   └─> Explores site, identifies issues

4. Generate Variant Suggestions (AI)
   └─> ["Add filter sidebar", "Add search bar", ...]

5. For each suggestion:
   ├─> Create Experimental Variant
   ├─> Spawn Code Agent (Claude)
   │   └─> Implements the suggestion
   └─> Run Browser Agent on Variant
       └─> Compare results
```

---

## Schemas

### 1. Experiment (`experiment.db.ts`)

**Purpose:** Top-level entity representing an A/B testing experiment.

**Table:** `experiments`

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | `Id<'experiment'>` | Unique identifier (e.g., `exp_abc123`) |
| `createdAt` | `timestamp` | When experiment was created |
| `updatedAt` | `timestamp` | Last updated timestamp |
| `repoUrl` | `text` (required) | Git repository URL to test |
| `goal` | `text` (required) | User issue/problem to address |
| `status` | `'pending' \| 'running' \| 'completed' \| 'failed'` | Experiment status |
| `variantSuggestions` | `string[]` | AI-generated UX improvements |

**Example:**
```typescript
{
  id: 'exp_abc123',
  repoUrl: 'https://github.com/user/ecommerce-site',
  goal: 'Users complaining about not finding products easily',
  status: 'running',
  variantSuggestions: [
    'Add filter sidebar with price/category/size options',
    'Implement search bar with autocomplete',
    'Add sorting dropdown'
  ]
}
```

**Relationships:**
- Has many **Variants**
- Has many **Agents** (indirectly through variants)
- Has many **CodeAgents** (indirectly through variants)

---

### 2. Variant (`variant.db.ts`)

**Purpose:** Represents a specific version of the application being tested (control or experimental).

**Table:** `variants`

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | `Id<'variant'>` | Unique identifier (e.g., `var_xyz789`) |
| `createdAt` | `timestamp` | When variant was created |
| `experimentId` | `Id<'experiment'>` | Foreign key to experiment |
| `daytonaSandboxId` | `text` (required) | Daytona sandbox ID where code runs |
| `publicUrl` | `text` (required) | Preview URL for the variant |
| `type` | `'control' \| 'experiment'` | Variant type |
| `suggestion` | `text` | UX improvement this variant tests (null for control) |
| `analysis` | `object` | Browser agent test results |

**Analysis Object:**
```typescript
{
  success: boolean;      // Did the test complete successfully
  summary: string;       // Brief description of findings
  insights: string[];    // Key observations
  issues: string[];      // Problems encountered
}
```

**Example (Control):**
```typescript
{
  id: 'var_control',
  experimentId: 'exp_abc123',
  daytonaSandboxId: 'sb_111',
  publicUrl: 'https://sb-111.daytona.io',
  type: 'control',
  suggestion: null,  // No changes - baseline
  analysis: {
    success: true,
    summary: 'User browsed products but couldn\'t filter results',
    insights: ['No filtering UI found', 'Had to scroll through 50+ products'],
    issues: ['Missing filter functionality', 'Poor product discoverability']
  }
}
```

**Example (Experimental):**
```typescript
{
  id: 'var_exp_001',
  experimentId: 'exp_abc123',
  daytonaSandboxId: 'sb_222',
  publicUrl: 'https://sb-222.daytona.io',
  type: 'experiment',
  suggestion: 'Add filter sidebar with price/category/size options',
  analysis: {
    success: true,
    summary: 'User easily filtered products by price and category',
    insights: ['Filter sidebar intuitive', 'Reduced time to find products'],
    issues: []
  }
}
```

**Relationships:**
- Belongs to **Experiment**
- Has one **Agent** (browser test)
- Has one **CodeAgent** (for experimental variants only)

---

### 3. Agent (`agent.db.ts`)

**Purpose:** Tracks browser automation tests (Browser-use) that explore variants and identify UX issues.

**Table:** `agents`

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | `Id<'agent'>` | Unique identifier (e.g., `a_browser123`) |
| `createdAt` | `timestamp` | When agent was created |
| `experimentId` | `Id<'experiment'>` | Foreign key to experiment |
| `variantId` | `Id<'variant'>` | Foreign key to variant being tested |
| `browserTaskId` | `text` (required) | Browser-use task ID |
| `browserLiveUrl` | `text` | Live URL to watch browser agent |
| `taskPrompt` | `text` (required) | AI-generated task instructions |
| `status` | `'pending' \| 'running' \| 'completed' \| 'failed'` | Agent status |
| `result` | `object` | AI analysis of test results |
| `rawLogs` | `text` | Full browser automation logs |

**Result Object:**
```typescript
{
  success: boolean;
  summary: string;
  insights: string[];
  issues: string[];
}
```

**Example:**
```typescript
{
  id: 'a_browser123',
  experimentId: 'exp_abc123',
  variantId: 'var_control',
  browserTaskId: 'bt_xyz',
  browserLiveUrl: 'https://browser-use.com/live/bt_xyz',
  taskPrompt: 'Visit the e-commerce website and browse for products as if you\'re a customer looking to buy something specific. Try to find products in a particular category, and see if there are ways to filter or narrow down your search...',
  status: 'completed',
  result: {
    success: true,
    summary: 'Browsed product catalog, attempted filtering but no UI found',
    insights: ['Cannot filter by price', 'No category navigation'],
    issues: ['Missing filter functionality']
  },
  rawLogs: '...'
}
```

**Relationships:**
- Belongs to **Experiment**
- Belongs to **Variant**
- Tests one variant at a time

**Key Points:**
- Browser agents simulate real users exploring the site
- Task prompts are natural, exploratory (not rigid step-by-step)
- Results include UX insights from AI analysis
- Same test run on control and all experimental variants

---

### 4. CodeAgent (`codeAgent.db.ts`)

**Purpose:** Tracks Claude Code agents that autonomously implement UX improvements in experimental variants.

**Table:** `code_agents`

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | `Id<'codeAgent'>` | Unique identifier (e.g., `ca_claude123`) |
| `createdAt` | `timestamp` | When code agent was created |
| `updatedAt` | `timestamp` | Last updated timestamp |
| `experimentId` | `Id<'experiment'>` | Foreign key to experiment |
| `variantId` | `Id<'variant'>` | Foreign key to experimental variant |
| `claudeSessionId` | `text` | Claude Code session identifier |
| `daytonaSandboxId` | `text` (required) | Sandbox where Claude works |
| `suggestion` | `text` (required) | UX improvement to implement |
| `implementationPrompt` | `text` (required) | Full prompt given to Claude |
| `status` | `'pending' \| 'running' \| 'completed' \| 'failed'` | Implementation status |
| `implementationSummary` | `text` | What Claude accomplished |
| `filesModified` | `string[]` | List of files changed |
| `codeChanges` | `object[]` | Detailed code changes |
| `logs` | `text` | Full Claude session logs |
| `errorMessage` | `text` | Error if failed |
| `startedAt` | `timestamp` | When Claude started |
| `completedAt` | `timestamp` | When Claude finished |

**Code Changes Object:**
```typescript
{
  file: string;      // File path
  changes: string;   // Description of changes
}
```

**Example:**
```typescript
{
  id: 'ca_claude123',
  experimentId: 'exp_abc123',
  variantId: 'var_exp_001',
  claudeSessionId: 'claude-session-12345',
  daytonaSandboxId: 'sb_222',
  suggestion: 'Add filter sidebar with price/category/size options',
  implementationPrompt: 'You are a senior software engineer tasked with implementing a UX improvement...',
  status: 'completed',
  implementationSummary: 'Created FilterSidebar component with price, category, and size filters. Integrated into product listing page.',
  filesModified: [
    'src/components/FilterSidebar.tsx',
    'src/app/products/page.tsx',
    'src/styles/filters.css'
  ],
  codeChanges: [
    {
      file: 'src/components/FilterSidebar.tsx',
      changes: 'Created new filter sidebar component'
    },
    {
      file: 'src/app/products/page.tsx',
      changes: 'Integrated FilterSidebar and added filtering logic'
    }
  ],
  logs: '...',
  startedAt: '2025-01-18T10:00:00Z',
  completedAt: '2025-01-18T10:03:42Z'
}
```

**Relationships:**
- Belongs to **Experiment**
- Belongs to **Variant** (experimental variants only)
- Creates code for one experimental variant

**Key Points:**
- Code agents only exist for experimental variants (not control)
- Claude Code autonomously implements UX improvements
- Full audit trail of every file modified
- Runs in isolated Daytona sandbox
- Reports results back to API via webhook

---

## Common Patterns

### Status Flow

All entities follow a similar status lifecycle:

```
pending → running → completed
                  ↘ failed
```

### Timestamp Tracking

Standard timestamp fields on all entities:
- `createdAt` - When entity was created (auto-set)
- `updatedAt` - Last modification (auto-updated on code agents)
- Custom timestamps where needed (e.g., `startedAt`, `completedAt`)

### ID Prefixes

All IDs use typed prefixes for clarity:
- `exp_` - Experiments
- `var_` - Variants
- `a_` - Agents (browser)
- `ca_` - Code Agents (Claude)

### Foreign Keys

All relationships use foreign keys:
- Experiments → Variants: `variantId` references `experiments.id`
- Variants → Agents: `agentId` references `variants.id`
- Variants → Code Agents: `variantId` references `variants.id`

---

## Query Examples

### Get all variants for an experiment

```typescript
const variants = await db
  .select()
  .from(variantsTable)
  .where(eq(variantsTable.experimentId, experimentId));
```

### Get control variant

```typescript
const control = await db
  .select()
  .from(variantsTable)
  .where(
    and(
      eq(variantsTable.experimentId, experimentId),
      eq(variantsTable.type, 'control')
    )
  );
```

### Get all experimental variants

```typescript
const experiments = await db
  .select()
  .from(variantsTable)
  .where(
    and(
      eq(variantsTable.experimentId, experimentId),
      eq(variantsTable.type, 'experiment')
    )
  );
```

### Get browser agent results for a variant

```typescript
const agent = await db
  .select()
  .from(agentsTable)
  .where(eq(agentsTable.variantId, variantId))
  .limit(1);
```

### Get code agent for a variant

```typescript
const codeAgent = await db
  .select()
  .from(codeAgentsTable)
  .where(eq(codeAgentsTable.variantId, variantId))
  .limit(1);
```

### Get all completed code agents for experiment

```typescript
const completedAgents = await db
  .select()
  .from(codeAgentsTable)
  .where(
    and(
      eq(codeAgentsTable.experimentId, experimentId),
      eq(codeAgentsTable.status, 'completed')
    )
  );
```

---

## Data Flow Example

### Complete Experiment Lifecycle

```typescript
// 1. Create experiment
const experiment = {
  id: 'exp_abc123',
  repoUrl: 'https://github.com/user/ecommerce',
  goal: 'Users can\'t filter products',
  status: 'pending'
};

// 2. Create control variant (original code)
const controlVariant = {
  id: 'var_control',
  experimentId: 'exp_abc123',
  daytonaSandboxId: 'sb_111',
  publicUrl: 'https://sb-111.daytona.io',
  type: 'control',
  suggestion: null
};

// 3. Run browser agent on control
const controlAgent = {
  id: 'a_control',
  experimentId: 'exp_abc123',
  variantId: 'var_control',
  taskPrompt: 'Browse products and try to filter...',
  result: {
    success: true,
    summary: 'No filtering found',
    insights: ['Missing filter UI'],
    issues: ['Cannot filter by price or category']
  }
};

// 4. AI generates suggestions
experiment.variantSuggestions = [
  'Add filter sidebar',
  'Add search bar'
];

// 5. Create experimental variant
const expVariant = {
  id: 'var_exp_001',
  experimentId: 'exp_abc123',
  daytonaSandboxId: 'sb_222',
  type: 'experiment',
  suggestion: 'Add filter sidebar'
};

// 6. Spawn code agent
const codeAgent = {
  id: 'ca_claude123',
  experimentId: 'exp_abc123',
  variantId: 'var_exp_001',
  suggestion: 'Add filter sidebar',
  status: 'running'
};

// 7. Claude implements changes
codeAgent.status = 'completed';
codeAgent.filesModified = ['src/components/FilterSidebar.tsx'];

// 8. Test experimental variant
const expAgent = {
  id: 'a_exp_001',
  experimentId: 'exp_abc123',
  variantId: 'var_exp_001',
  result: {
    success: true,
    summary: 'Filtering works great!',
    insights: ['Easy to use', 'Fast filtering'],
    issues: []
  }
};

// 9. Compare results
// controlAgent.result vs expAgent.result
```

---

## Best Practices

### Naming Conventions

- **Tables:** Plural, lowercase (e.g., `experiments`, `variants`)
- **Columns:** snake_case (e.g., `created_at`, `browser_task_id`)
- **Types:** PascalCase with `Entity` suffix (e.g., `ExperimentEntity`)

### Required Fields

Mark fields as required using `.notNull()`:
```typescript
repoUrl: text('repo_url').notNull()
```

### Default Values

Provide sensible defaults:
```typescript
status: text('status').notNull().default('pending')
createdAt: timestamp('created_at').defaultNow()
```

### JSON Fields

Use `jsonb` for structured data with TypeScript types:
```typescript
analysis: jsonb('analysis').$type<{
  success: boolean;
  summary: string;
  insights: string[];
  issues: string[];
}>()
```

### References

Always define foreign key relationships:
```typescript
experimentId: text('experiment_id')
  .references(() => experimentsTable.id)
  .notNull()
```

---

## Migration Checklist

When adding new schemas:

- [ ] Create `<entity>.db.ts` file in `src/db/`
- [ ] Define table with `pgTable()`
- [ ] Export TypeScript type with `$inferSelect`
- [ ] Add foreign keys for relationships
- [ ] Use typed IDs from `@/lib/id`
- [ ] Document the schema in this README
- [ ] Update API structure docs if needed
- [ ] Run database migration
