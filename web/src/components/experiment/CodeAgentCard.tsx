import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  RiGitPullRequestLine,
  RiExternalLinkLine,
  RiLoader4Line,
  RiCheckLine,
  RiTimeLine,
} from '@remixicon/react';

interface CodeAgentCardProps {
  codeAgent: {
    id: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    prUrl?: string;
    sandboxUrl?: string;
    publicUrl?: string;
  };
  variantDescription: string;
}

export const CodeAgentCard = ({ codeAgent, variantDescription }: CodeAgentCardProps) => {
  const statusConfig = {
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

  const config = statusConfig[codeAgent.status];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm">Code Agent</CardTitle>
          <div className="flex items-center gap-1 text-neutral-500 flex-shrink-0">
            {config.icon}
            <span className="text-xs">{config.label}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Variant Description */}
        <div>
          <p className="text-xs text-neutral-500 mb-1.5">Implementing</p>
          <p className="text-xs text-neutral-700 bg-neutral-50 p-2 rounded border">
            {variantDescription}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {/* PR Link */}
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

          {/* Public URL */}
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

        {/* Status Messages */}
        {codeAgent.status === 'running' && (
          <div className="flex items-start gap-2 text-neutral-600 bg-neutral-50 p-2 rounded border">
            <RiLoader4Line size={12} className="animate-spin mt-0.5 flex-shrink-0" />
            <p className="text-xs">Creating changes...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
