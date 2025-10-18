import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_CLIENT } from './api-client';

// Types
interface Experiment {
  id: string;
  repoUrl: string;
  goal: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

interface ExperimentDetail extends Experiment {
  variants?: Array<{
    id: string;
    description: string;
    status: string;
  }>;
  results?: {
    message: string;
    improvements: string[];
  };
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
    queryFn: () => {
      return API_CLIENT.fetch('/api/experiments', {}) as Promise<Experiment[]>;
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
    queryFn: () => {
      return API_CLIENT.fetch(`/api/experiments/${experimentId}`, {}) as Promise<ExperimentDetail>;
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
      return API_CLIENT.fetch('/api/experiments', {
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
