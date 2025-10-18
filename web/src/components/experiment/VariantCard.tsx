import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  RiLoader4Line,
  RiCheckLine,
  RiTimeLine,
  RiGitPullRequestLine,
  RiExternalLinkLine,
} from '@remixicon/react';

interface VariantIdeaCardProps {
  variantIdea: {
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
  };
  index: number;
}

export const VariantCard = ({ variantIdea, index }: VariantIdeaCardProps) => {
  const statusConfig = {
    pending: {
      icon: <RiTimeLine size={12} />,
      label: 'Pending',
    },
    in_progress: {
      icon: <RiLoader4Line size={12} className="animate-spin" />,
      label: 'In Progress',
    },
    completed: {
      icon: <RiCheckLine size={12} />,
      label: 'Completed',
    },
  };

  const codeAgentStatusConfig = {
    pending: {
      icon: <RiTimeLine size={12} />,
      label: 'Pending',
    },
    running: {
      icon: <RiLoader4Line size={12} className="animate-spin" />,
      label: 'Running',
    },
    completed: {
      icon: <RiCheckLine size={12} />,
      label: 'Completed',
    },
    failed: {
      icon: <RiTimeLine size={12} />,
      label: 'Failed',
    },
  };

  const config = statusConfig[variantIdea.status];
  const codeAgent = variantIdea.codeAgent;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1">
            <div className="bg-neutral-100 text-neutral-600 rounded w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs font-medium mt-0.5">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm leading-tight">{variantIdea.description}</CardTitle>
            </div>
          </div>
          <div className="flex items-center gap-1 text-neutral-500 flex-shrink-0">
            {config.icon}
            <span className="text-xs">{config.label}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div>
          <p className="text-xs text-neutral-500 mb-1.5">Reasoning</p>
          <p className="text-xs text-neutral-700 leading-relaxed">
            {variantIdea.reasoning}
          </p>
        </div>

        {/* Code Agent Section */}
        {codeAgent && (
          <div className="pt-3 border-t space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-neutral-500">Code Agent</p>
              <div className="flex items-center gap-1 text-neutral-500">
                {codeAgentStatusConfig[codeAgent.status].icon}
                <span className="text-xs">{codeAgentStatusConfig[codeAgent.status].label}</span>
              </div>
            </div>

            {/* Action Buttons */}
            {(codeAgent.prUrl || codeAgent.publicUrl) && (
              <div className="space-y-2">
                {codeAgent.prUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start h-8"
                    onClick={() => window.open(codeAgent.prUrl, '_blank')}
                  >
                    <RiGitPullRequestLine size={12} className="mr-2" />
                    View Pull Request
                    <RiExternalLinkLine size={10} className="ml-auto" />
                  </Button>
                )}

                {codeAgent.publicUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start h-8"
                    onClick={() => window.open(codeAgent.publicUrl, '_blank')}
                  >
                    <RiExternalLinkLine size={12} className="mr-2" />
                    View Preview
                  </Button>
                )}
              </div>
            )}

            {/* Status Messages */}
            {codeAgent.status === 'running' && !codeAgent.publicUrl && (
              <div className="flex items-start gap-2 text-neutral-600 bg-neutral-50 p-2 rounded border">
                <RiLoader4Line size={12} className="animate-spin mt-0.5 flex-shrink-0" />
                <p className="text-xs">Creating changes...</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
