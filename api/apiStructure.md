# API Structure Documentation

## Overview

This API is built with Bun and Elysia, following a service-oriented architecture with clear separation of concerns. The codebase uses Daytona for development environments, Browser-use for browser automation, and Inngest for background jobs and durable execution.

## Directory Structure

```
src/
├── lib/              # Shared libraries, clients, and utilities
├── service/          # Business logic organized by domain
├── db/              # Database entities and schemas
└── index.ts         # Application entry point
```

## Core Principles

### 1. Library Layer (`src/lib/`)

The library layer contains:
- **External client initialization** (Daytona, Browser-use)
- **Shared utilities** (ID generation, environment variables)
- **Inngest configuration** (client and function registry)

**Important**: Libraries should ONLY be initialized here, but NEVER used directly. All usage must go through services.

#### Key Files

- `src/lib/daytona.ts` - Daytona SDK client initialization
- `src/lib/browser-use.ts` - Browser-use client initialization
- `src/lib/inngest-client.ts` - Inngest client instance
- `src/lib/inngest-functions.ts` - Registry of all Inngest functions
- `src/lib/inngest.ts` - Inngest HTTP handler for Elysia
- `src/lib/env.ts` - Environment variable validation and types
- `src/lib/client.ts` - Database client initialization
- `src/lib/id.ts` - ID generation utilities

### 2. Service Layer (`src/service/`)

Services contain all business logic and are organized by domain. Each service can contain:
- `*.service.ts` - Main service class and route definitions
- `*.jobs.ts` - Inngest job/function definitions
- Subdirectories for complex domains

**Structure Example:**
```
src/service/
├── experiment/
│   ├── Experiment.service.ts    # Routes and business logic
│   └── Experiment.jobs.ts       # Background jobs
├── variant/
│   └── Variant.service.ts
└── browser/
    └── Browser.service.ts
```

#### Service File Pattern (`*.service.ts`)

Services should:
- Export Elysia route handlers with a specific prefix
- Export an abstract service class with static methods for business logic
- Use libraries (Daytona, Browser-use) ONLY within service methods
- Never expose library clients directly

**Example:**
```typescript
import { daytona } from '@/lib/daytona';
import { browserUse } from '@/lib/browser-use';

// Route definitions
export const experimentRoutes = new Elysia({ prefix: '/experiment' })
  .get('/', () => { /* ... */ })
  .post('/', async ({ body }) => { /* ... */ });

// Business logic
export abstract class ExperimentService {
  static async createWorkspace(repoUrl: string) {
    // Use Daytona through service method
    return await daytona.workspaces.create({ repoUrl });
  }
}
```

### 3. Background Jobs (`*.jobs.ts`)

All Inngest functions/jobs should be defined in `*.jobs.ts` files within their respective service directories.

#### Job File Pattern

**Location:** `src/service/<domain>/<Domain>.jobs.ts`

**Example:** `src/service/experiment/Experiment.jobs.ts`

```typescript
import { inngestClient } from '@/lib/inngest-client';
import { ExperimentService } from './Experiment.service';

export interface ExperimentCreationJobData {
  experiment: ExperimentEntity;
}

export const runExperimentJob = inngestClient.createFunction(
  {
    id: 'experiment-creation',
    concurrency: 2
  },
  { event: 'experiment/create' },
  async ({ event, step }) => {
    const { experiment } = event.data as ExperimentCreationJobData;

    await step.run('initialize-experiment', async () => {
      return await ExperimentService.updateExperimentStatus(
        experiment,
        'running'
      );
    });

    await step.run('create-workspace', async () => {
      return await ExperimentService.createWorkspace(experiment.repoUrl);
    });
  }
);
```

#### Job Organization

For complex domains with multiple jobs, create subdirectories:

```
src/service/experiment/
├── Experiment.service.ts
├── jobs/
│   ├── creation.jobs.ts
│   ├── execution.jobs.ts
│   └── cleanup.jobs.ts
└── types.ts
```

#### Registering Jobs

All job functions must be registered in `src/lib/inngest-functions.ts`:

```typescript
import { runExperimentJob } from '@/service/experiment/Experiment.jobs';

export const INNGEST_FUNCTIONS = [
  runExperimentJob,
  // Add other jobs here
];
```

### 4. Database Layer (`src/db/`)

Database entities and Drizzle schemas are defined here.

**Pattern:** `src/db/<entity>.db.ts`

```typescript
export interface ExperimentEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  repoUrl: string;
  goal: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export const experimentsTable = sqliteTable('experiments', {
  id: text('id').primaryKey(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  repoUrl: text('repo_url').notNull(),
  goal: text('goal').notNull(),
  status: text('status').notNull(),
});
```

## Best Practices

### Service Guidelines

1. **Separation of Concerns**
   - Libraries in `src/lib/` are for initialization only
   - All business logic belongs in services
   - Services consume libraries, never the other way around

2. **Library Usage**
   - Import library clients (daytona, browserUse) ONLY in service files
   - Wrap library calls in service methods for testability
   - Never pass library clients as function parameters

3. **Route Organization**
   - Each service should export an Elysia instance with routes
   - Use consistent prefix naming: `/experiment`, `/variant`, etc.
   - Define route schemas using Elysia's `t` object

### Job Guidelines

1. **File Naming**
   - Use `*.jobs.ts` suffix for all Inngest function files
   - Place jobs in the same service directory as related business logic

2. **Job Structure**
   - Export job data interfaces for type safety
   - Use descriptive job IDs: `experiment-creation`, `workspace-cleanup`
   - Break complex jobs into multiple steps using `step.run()`

3. **Event Naming**
   - Use namespaced event names: `experiment/create`, `variant/test`
   - Keep event names consistent with service domains

4. **Registration**
   - Always register new jobs in `src/lib/inngest-functions.ts`
   - Jobs not registered will not be executed

### Database Guidelines

1. **Entity Definition**
   - Define TypeScript interfaces for entities
   - Use Drizzle schemas for table definitions
   - Keep related entities in separate files

2. **Naming Conventions**
   - File: `<entity>.db.ts`
   - Interface: `<Entity>Entity`
   - Table: `<entity>sTable`

## Example Workflow

### Creating a New Feature

1. **Define the database entity** in `src/db/<entity>.db.ts`
2. **Create service directory** `src/service/<entity>/`
3. **Implement service logic** in `<Entity>.service.ts`:
   - Export routes as Elysia instance
   - Export abstract service class with static methods
   - Use library clients (Daytona, Browser-use) within methods
4. **Create background jobs** in `<Entity>.jobs.ts`:
   - Define job data interfaces
   - Create helper functions to send evnets to start jobs in the `.jobs.ts` file, so we have proper types
   - Create Inngest functions using `inngestClient.createFunction`
   - Call service methods from job steps
5. **Register jobs** in `src/lib/inngest-functions.ts`
6. **Mount routes** in `src/index.ts`

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Client Request                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Elysia Routes                          │
│              (*.service.ts exports)                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│               Service Layer                             │
│         (Business Logic & Orchestration)                │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Daytona    │  │ Browser-use  │  │   Inngest    │ │
│  │    Client    │  │   Client     │  │   Events     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Database Layer (Drizzle)                   │
└─────────────────────────────────────────────────────────┘

                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│             Background Jobs (Inngest)                   │
│                (*.jobs.ts files)                        │
└─────────────────────────────────────────────────────────┘
```

## Common Patterns

### Triggering Background Jobs

From a service method:
```typescript
import { inngestClient } from '@/lib/inngest-client';

export abstract class ExperimentService {
  static async createExperiment(data: CreateExperimentData) {
    const experiment = await this.insertExperiment(data);

    // Trigger background job
    await inngestClient.send({
      name: 'experiment/create',
      data: { experiment }
    });

    return experiment;
  }
}
```

### Multi-Step Jobs

```typescript
export const complexJob = inngestClient.createFunction(
  { id: 'complex-workflow' },
  { event: 'workflow/start' },
  async ({ event, step }) => {
    const workspace = await step.run('create-workspace', async () => {
      return await WorkspaceService.create(event.data);
    });

    const browser = await step.run('launch-browser', async () => {
      return await BrowserService.launch(workspace.id);
    });

    await step.run('run-tests', async () => {
      return await TestService.execute(browser.id);
    });
  }
);
```

### Error Handling in Jobs

```typescript
export const resilientJob = inngestClient.createFunction(
  {
    id: 'resilient-job',
    retries: 3
  },
  { event: 'job/run' },
  async ({ event, step }) => {
    try {
      await step.run('risky-operation', async () => {
        return await RiskyService.execute();
      });
    } catch (error) {
      // Log and handle error
      await step.run('handle-error', async () => {
        return await ErrorService.log(error);
      });
      throw error; // Inngest will retry
    }
  }
);
```

## Summary

- **Libraries** (`src/lib/`): Initialize clients, never use them directly
- **Services** (`src/service/`): All business logic, use libraries here
- **Jobs** (`*.jobs.ts`): Background tasks using Inngest, organized by service
- **Database** (`src/db/`): Entity definitions and schemas
- **Clear boundaries**: Libraries → Services → Jobs
- **Consistent naming**: Follow the established patterns for maintainability
