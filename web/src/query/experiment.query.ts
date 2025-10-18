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

// Control variant with browser agent analysis
interface ControlVariant {
  id: string;
  sandboxUrl: string;
  publicUrl: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  browserAgent?: {
    id: string;
    taskPrompt: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    liveUrl?: string;
    analysis?: {
      success: boolean;
      summary: string;
      insights: string[];
      issues: string[];
      suggestions?: string[];
    };
    rawLogs?: string;
  };
}

// Variant idea from LLM
interface VariantIdea {
  id: string;
  description: string;
  reasoning: string;
  status: 'pending' | 'in_progress' | 'completed';
  codeAgent?: {
    id: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    prUrl?: string;
    sandboxUrl?: string;
    publicUrl?: string;
  };
}

interface ExperimentDetail extends Experiment {
  controlVariant?: ControlVariant;
  variantIdeas?: VariantIdea[];
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
    queryFn: async (): Promise<Experiment[]> => {
      // TODO: Replace with actual API call when backend is ready
      // For now, return placeholder data
      return [
        {
          id: 'exp-001',
          repoUrl: 'https://github.com/example/e-commerce-app',
          goal: 'Improve checkout conversion rate by optimizing the payment flow',
          status: 'completed',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'exp-002',
          repoUrl: 'https://github.com/example/landing-page',
          goal: 'Increase signup conversion by improving CTA visibility and form UX',
          status: 'running',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        },
        {
          id: 'exp-003',
          repoUrl: 'https://github.com/example/mobile-app-web',
          goal: 'Reduce app download friction by streamlining the onboarding process',
          status: 'running',
          createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        },
        {
          id: 'exp-004',
          repoUrl: 'https://github.com/example/blog-platform',
          goal: 'Improve article readability and engagement metrics',
          status: 'pending',
          createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        },
        {
          id: 'exp-005',
          repoUrl: 'https://github.com/example/dashboard-app',
          goal: 'Optimize dashboard load time and improve data visualization clarity',
          status: 'failed',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
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
      // TODO: Replace with actual API call when backend is ready
      // For now, return placeholder data
      return {
        id: experimentId || 'exp-001',
        repoUrl: 'https://github.com/example/test-app',
        goal: 'Improve signup conversion rate by optimizing the user onboarding flow',
        status: 'running',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        controlVariant: {
          id: 'variant-control',
          sandboxUrl: 'https://sandbox.daytona.io/abc123',
          publicUrl: 'https://preview-abc123.daytona.app',
          status: 'completed',
          browserAgent: {
            id: 'agent-browser-001',
            taskPrompt: 'Navigate to the signup page, complete the registration form, and submit it to test the user onboarding flow.',
            status: 'completed',
            liveUrl: 'https://browser.use.com/session/abc123',
            analysis: {
              success: true,
              summary: 'Successfully completed signup flow in 23 seconds. The form was functional but could be more intuitive.',
              insights: [
                'Signup button was easily discoverable',
                'Form fields were clearly labeled',
                'Password requirements were well communicated',
                'Email confirmation worked smoothly',
              ],
              issues: [
                'Form validation messages appeared too late',
                'No visual feedback on password strength',
                'Submit button did not show loading state',
                'Error messages were not descriptive enough',
              ],
              suggestions: [
                'Add real-time validation feedback',
                'Include a password strength indicator',
                'Show loading state on form submission',
                'Improve error message clarity',
              ],
            },
            rawLogs: '[Browser logs would be here in production]',
          },
        },
        variantIdeas: [
          {
            id: 'idea-001',
            description: 'Add real-time form validation with instant feedback',
            reasoning: 'Users reported confusion when validation errors only appeared after submission. Real-time feedback will reduce frustration and improve form completion rates.',
            status: 'completed',
            codeAgent: {
              id: 'code-agent-001',
              status: 'completed',
              prUrl: 'https://github.com/example/test-app/pull/42',
              sandboxUrl: 'https://sandbox.daytona.io/variant-001',
              publicUrl: 'https://preview-variant001.daytona.app',
            },
          },
          {
            id: 'idea-002',
            description: 'Implement password strength indicator',
            reasoning: 'Analysis showed users often created weak passwords. A visual strength indicator will encourage stronger passwords and improve account security.',
            status: 'in_progress',
            codeAgent: {
              id: 'code-agent-002',
              status: 'running',
              sandboxUrl: 'https://sandbox.daytona.io/variant-002',
            },
          },
          {
            id: 'idea-003',
            description: 'Add loading state to submit button with progress indicator',
            reasoning: 'Users clicked submit multiple times due to lack of feedback. A loading state will prevent duplicate submissions and improve perceived performance.',
            status: 'pending',
          },
          {
            id: 'idea-004',
            description: 'Enhance error messages with actionable guidance',
            reasoning: 'Current error messages are vague. More specific, actionable error messages will help users fix issues quickly.',
            status: 'pending',
          },
        ],
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
