# API Reference

Complete API documentation for the autonomous experimentation system.

## Base URL

```
http://localhost:8000
```

---

## Experiments

### Get All Experiments

```http
GET /experiment
```

Returns a list of all experiments, ordered by creation date (most recent first), limited to 10.

**Response:**
```json
[
  {
    "id": "exp_abc123",
    "repoUrl": "https://github.com/user/ecommerce-site",
    "goal": "Users complaining about not finding products easily",
    "status": "running",
    "createdAt": "2025-01-18T10:00:00Z",
    "updatedAt": "2025-01-18T10:05:00Z",
    "variantSuggestions": [
      "Add filter sidebar with price/category/size options",
      "Implement search bar with autocomplete"
    ]
  }
]
```

**Status Values:**
- `pending` - Experiment created, not yet started
- `running` - Currently executing
- `completed` - Finished successfully
- `failed` - Encountered an error

---

### Get Experiment by ID

```http
GET /experiment/:id
```

Returns a single experiment by ID.

**Parameters:**
- `id` (path) - Experiment ID (e.g., `exp_abc123`)

**Response:**
```json
[
  {
    "id": "exp_abc123",
    "repoUrl": "https://github.com/user/ecommerce-site",
    "goal": "Users complaining about not finding products easily",
    "status": "running",
    "createdAt": "2025-01-18T10:00:00Z",
    "updatedAt": "2025-01-18T10:05:00Z",
    "variantSuggestions": [
      "Add filter sidebar with price/category/size options"
    ]
  }
]
```

**Note:** Returns an array with single element for consistency.

---

### Create Experiment

```http
POST /experiment
```

Creates a new experiment and triggers the experimentation workflow.

**Request Body:**
```json
{
  "repoUrl": "https://github.com/user/ecommerce-site",
  "goal": "Users complaining about not finding products easily"
}
```

**Response:**
```json
{
  "id": "exp_abc123",
  "repoUrl": "https://github.com/user/ecommerce-site",
  "goal": "Users complaining about not finding products easily",
  "status": "pending",
  "createdAt": "2025-01-18T10:00:00Z",
  "updatedAt": "2025-01-18T10:00:00Z"
}
```

**Workflow Triggered:**
1. Creates control variant (Daytona sandbox with original code)
2. Runs browser agent to test control variant
3. Analyzes results with AI
4. Generates UX improvement suggestions
5. Creates experimental variants for each suggestion
6. Spawns Claude Code agents to implement changes
7. Tests each experimental variant

---

## Variants

### Get Variants for Experiment

```http
GET /variant/experiment/:experimentId
```

Returns all variants (control + experimental) for a specific experiment.

**Parameters:**
- `experimentId` (path) - Experiment ID

**Response:**
```json
[
  {
    "id": "var_control",
    "createdAt": "2025-01-18T10:01:00Z",
    "experimentId": "exp_abc123",
    "daytonaSandboxId": "sb_111",
    "publicUrl": "https://sb-111.daytona.io",
    "type": "control",
    "suggestion": null,
    "analysis": {
      "success": true,
      "summary": "User browsed products but couldn't filter results",
      "insights": ["No filtering UI found", "Had to scroll through 50+ products"],
      "issues": ["Missing filter functionality"]
    }
  },
  {
    "id": "var_exp_001",
    "createdAt": "2025-01-18T10:05:00Z",
    "experimentId": "exp_abc123",
    "daytonaSandboxId": "sb_222",
    "publicUrl": "https://sb-222.daytona.io",
    "type": "experiment",
    "suggestion": "Add filter sidebar with price/category/size options",
    "analysis": null
  }
]
```

**Variant Types:**
- `control` - Original code (baseline)
- `experiment` - Modified code with UX improvement

---

### Get Variant by ID

```http
GET /variant/:id
```

Returns a single variant by ID.

**Parameters:**
- `id` (path) - Variant ID

**Response:**
```json
[
  {
    "id": "var_exp_001",
    "createdAt": "2025-01-18T10:05:00Z",
    "experimentId": "exp_abc123",
    "daytonaSandboxId": "sb_222",
    "publicUrl": "https://sb-222.daytona.io",
    "type": "experiment",
    "suggestion": "Add filter sidebar",
    "analysis": {
      "success": true,
      "summary": "User easily filtered products",
      "insights": ["Filter sidebar intuitive"],
      "issues": []
    }
  }
]
```

---

## Agents (Browser Tests)

### Get Agents for Experiment

```http
GET /agent/experiment/:experimentId
```

Returns all browser agents for a specific experiment.

**Parameters:**
- `experimentId` (path) - Experiment ID

**Response:**
```json
[
  {
    "id": "a_browser123",
    "createdAt": "2025-01-18T10:02:00Z",
    "experimentId": "exp_abc123",
    "variantId": "var_control",
    "browserTaskId": "bt_xyz",
    "browserLiveUrl": "https://browser-use.com/live/bt_xyz",
    "taskPrompt": "Visit the e-commerce website and browse for products...",
    "status": "completed",
    "result": {
      "success": true,
      "summary": "Browsed products, attempted filtering but no UI found",
      "insights": ["Cannot filter by price", "No category navigation"],
      "issues": ["Missing filter functionality"]
    },
    "rawLogs": "..."
  }
]
```

**Agent Status:**
- `pending` - Created, not yet started
- `running` - Browser automation in progress
- `completed` - Test finished successfully
- `failed` - Test encountered an error

---

### Get Agent by ID

```http
GET /agent/:id
```

Returns a single browser agent by ID.

**Parameters:**
- `id` (path) - Agent ID

**Response:**
```json
[
  {
    "id": "a_browser123",
    "createdAt": "2025-01-18T10:02:00Z",
    "experimentId": "exp_abc123",
    "variantId": "var_control",
    "browserTaskId": "bt_xyz",
    "browserLiveUrl": "https://browser-use.com/live/bt_xyz",
    "taskPrompt": "...",
    "status": "completed",
    "result": { ... },
    "rawLogs": "..."
  }
]
```

---

### Get Agent by Variant

```http
GET /agent/variant/:variantId
```

Returns the browser agent for a specific variant.

**Parameters:**
- `variantId` (path) - Variant ID

**Response:**
```json
[
  {
    "id": "a_browser123",
    "variantId": "var_control",
    "status": "completed",
    "result": { ... }
  }
]
```

---

## Code Agents (Claude Implementations)

### Get Code Agents for Experiment

```http
GET /code-agent/experiment/:experimentId
```

Returns all code agents (Claude implementations) for a specific experiment.

**Parameters:**
- `experimentId` (path) - Experiment ID

**Response:**
```json
[
  {
    "id": "ca_claude123",
    "createdAt": "2025-01-18T10:05:00Z",
    "updatedAt": "2025-01-18T10:08:42Z",
    "experimentId": "exp_abc123",
    "variantId": "var_exp_001",
    "claudeSessionId": "claude-session-12345",
    "daytonaSandboxId": "sb_222",
    "suggestion": "Add filter sidebar with price/category/size options",
    "implementationPrompt": "You are a senior software engineer...",
    "status": "completed",
    "implementationSummary": "Created FilterSidebar component with filters",
    "filesModified": [
      "src/components/FilterSidebar.tsx",
      "src/app/products/page.tsx"
    ],
    "codeChanges": [
      {
        "file": "src/components/FilterSidebar.tsx",
        "changes": "Created new filter sidebar component"
      }
    ],
    "logs": "...",
    "errorMessage": null,
    "startedAt": "2025-01-18T10:05:30Z",
    "completedAt": "2025-01-18T10:08:42Z"
  }
]
```

**Code Agent Status:**
- `pending` - Created, not yet started
- `running` - Claude Code implementing changes
- `completed` - Implementation finished successfully
- `failed` - Implementation encountered an error

---

### Get Code Agent by ID

```http
GET /code-agent/:id
```

Returns a single code agent by ID.

**Parameters:**
- `id` (path) - Code agent ID

**Response:**
```json
[
  {
    "id": "ca_claude123",
    "experimentId": "exp_abc123",
    "variantId": "var_exp_001",
    "suggestion": "Add filter sidebar",
    "status": "completed",
    "implementationSummary": "...",
    "filesModified": [...],
    "codeChanges": [...],
    "startedAt": "2025-01-18T10:05:30Z",
    "completedAt": "2025-01-18T10:08:42Z"
  }
]
```

---

### Report Code Agent Results

```http
POST /code-agent/:id/results
```

Internal endpoint used by Claude Code script running in sandbox to report results.

**Parameters:**
- `id` (path) - Code agent ID

**Request Body:**
```json
{
  "status": "completed",
  "completedAt": "2025-01-18T10:08:42Z",
  "implementationSummary": "Created FilterSidebar component",
  "filesModified": ["src/components/FilterSidebar.tsx"],
  "logs": "...",
  "codeChanges": [
    {
      "file": "src/components/FilterSidebar.tsx",
      "changes": "Created new component"
    }
  ]
}
```

**Response:**
```json
{
  "success": true
}
```

---

## Health Check

### Health Endpoint

```http
GET /health
```

Returns API health status.

**Response:**
```
OK
```

---

## Frontend Integration

### React Query Usage

The frontend uses React Query to fetch data. Here's the pattern:

```typescript
// Get all experiments
const { experiments } = useExperimentsQuery();

// Get experiment detail with all related data
const { experiment } = useExperimentDetailQuery(experimentId);

// Create experiment
const { startExperiment } = useStartExperimentMutation();
await startExperiment({ repoUrl, goal });
```

### Frontend Data Structure

The frontend combines multiple API calls to create a complete view:

```typescript
interface ExperimentDetail {
  ...experiment,
  controlVariant: {
    ...variant,
    browserAgent: agent  // Matched by variantId
  },
  experimentalVariants: [
    {
      ...variant,
      browserAgent: agent,      // Matched by variantId
      codeAgent: codeAgent      // Matched by variantId
    }
  ]
}
```

**Data Flow:**
1. `GET /experiment/:id` → Get experiment
2. `GET /variant/experiment/:id` → Get all variants
3. `GET /agent/experiment/:id` → Get all agents
4. `GET /code-agent/experiment/:id` → Get all code agents
5. Frontend merges data by matching IDs

---

## CORS Configuration

The API allows cross-origin requests from all origins in development:

- **Allowed Origins:** `*` (all)
- **Allowed Methods:** `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`, `PATCH`
- **Allowed Headers:** `Content-Type`, `Authorization`, `X-Requested-With`, `Accept`, `Origin`

---

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `400` - Bad request (invalid input)
- `404` - Resource not found
- `500` - Internal server error

Error responses include descriptive messages to help debug issues.

---

## Pagination

Currently, only the experiments list is paginated:
- Limited to 10 most recent experiments
- Ordered by `createdAt` descending

To implement pagination on other endpoints, add query parameters:
```http
GET /variant/experiment/:experimentId?limit=10&offset=0
```

---

## Rate Limiting

No rate limiting is currently implemented. Consider adding rate limiting in production.

---

## Authentication

No authentication is currently required. In production, implement:
- API key authentication
- JWT tokens
- OAuth 2.0

The code agent results endpoint (`POST /code-agent/:id/results`) has placeholder authentication that should be replaced with proper auth in production.
