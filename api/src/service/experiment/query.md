import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_CLIENT } from './api-client';

// Database entity types (matching API responses)
interface Experiment {
  id: string;
  repoUrl: string;
  goal: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  variantSuggestions?: string[];
}

interface Variant {
  id: string;
  createdAt: string;
  experimentId: string;
  daytonaSandboxId: string;
  publicUrl: string;
  type: 'control' | 'experiment';
  suggestion: string | null;
  analysis: {
    success: boolean;
    summary: string;
    insights: string[];
    issues: string[];
  } | null;
}

interface Agent {
  id: string;
  createdAt: string;
  experimentId: string;
  variantId: string;
  browserTaskId: string;
  browserLiveUrl: string | null;
  taskPrompt: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result: {
    success: boolean;
    summary: string;
    insights: string[];
    issues: string[];
  } | null;
  rawLogs: string | null;
}

interface CodeAgent {
  id: string;
  createdAt: string;
  updatedAt: string;
  experimentId: string;
  variantId: string;
  claudeSessionId: string | null;
  daytonaSandboxId: string;
  suggestion: string;
  implementationPrompt: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  implementationSummary: string | null;
  filesModified: string[] | null;
  codeChanges: {
    file: string;
    changes: string;
  }[] | null;
  logs: string | null;
  errorMessage: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

// UI-specific types for display
interface ControlVariant extends Variant {
  type: 'control';
  browserAgent?: Agent;
}

interface ExperimentalVariant extends Variant {
  type: 'experiment';
  browserAgent?: Agent;
  codeAgent?: CodeAgent;
}

interface ExperimentDetail extends Experiment {
  controlVariant?: ControlVariant;
  experimentalVariants?: ExperimentalVariant[];
}

interface StartExperimentInput {
  repoUrl: string;
  goal: string;
}

interface StartExperimentResponse {
  id: string;
  repoUrl: string;
  goal: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
}

// Queries
export const useExperimentsQuery = () => {
  const query = useQuery({
    queryKey: ['experiments'],
    queryFn: async (): Promise<Experiment[]> => {
      return API_CLIENT.fetch('/experiment', {
        method: 'GET',
      });
    },
  });

  return {
    experiments: query.data,
    ...query,
  };
};

export const useExperimentDetailQuery = (experimentId: string | null) => {
  const query = useQuery({
    queryKey: ['experiment', experimentId],
    queryFn: async (): Promise<ExperimentDetail> => {
      if (!experimentId) {
        throw new Error('Experiment ID is required');
      }

      // Fetch experiment
      const experimentResponse = await API_CLIENT.fetch(`/experiment/${experimentId}`, {
        method: 'GET',
      });
      const experiment: Experiment = experimentResponse[0];

      // Fetch all variants for this experiment
      const variants: Variant[] = await API_CLIENT.fetch(
        `/variant/experiment/${experimentId}`,
        { method: 'GET' }
      );

      // Fetch all agents for this experiment
      const agents: Agent[] = await API_CLIENT.fetch(
        `/agent/experiment/${experimentId}`,
        { method: 'GET' }
      );

      // Fetch all code agents for this experiment
      const codeAgents: CodeAgent[] = await API_CLIENT.fetch(
        `/code-agent/experiment/${experimentId}`,
        { method: 'GET' }
      );

      // Find control variant
      const controlVariantData = variants.find((v) => v.type === 'control');
      let controlVariant: ControlVariant | undefined;

      if (controlVariantData) {
        const controlAgent = agents.find((a) => a.variantId === controlVariantData.id);
        controlVariant = {
          ...controlVariantData,
          type: 'control',
          browserAgent: controlAgent,
        };
      }

      // Build experimental variants
      const experimentalVariants: ExperimentalVariant[] = variants
        .filter((v) => v.type === 'experiment')
        .map((variant) => {
          const agent = agents.find((a) => a.variantId === variant.id);
          const codeAgent = codeAgents.find((ca) => ca.variantId === variant.id);

          return {
            ...variant,
            type: 'experiment',
            browserAgent: agent,
            codeAgent,
          };
        });

      return {
        ...experiment,
        controlVariant,
        experimentalVariants,
      };
    },
    enabled: !!experimentId,
  });

  return {
    experiment: query.data,
    ...query,
  };
};

// Mutations
export const useStartExperimentMutation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: StartExperimentInput) => {
      return API_CLIENT.fetch('/experiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }) as Promise<StartExperimentResponse>;
    },
    onSuccess: () => {
      // Invalidate experiments query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
    },
  });

  return {
    startExperiment: mutation.mutateAsync,
    ...mutation,
  };
};
