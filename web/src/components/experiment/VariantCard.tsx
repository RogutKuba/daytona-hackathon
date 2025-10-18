import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  RiLoader4Line,
  RiCheckLine,
  RiTimeLine,
  RiGitPullRequestLine,
  RiExternalLinkLine,
} from '@remixicon/react';

interface VariantCardProps {
  variant: {
    id: string;
    suggestion: string | null;
    publicUrl: string;
    daytonaSandboxId: string;
    analysis: {
      success: boolean;
      summary: string;
      insights: string[];
      issues: string[];
    } | null;
    codeAgent?: {
      id: string;
      status: 'pending' | 'running' | 'completed' | 'failed';
      daytonaSandboxId: string;
      implementationSummary: string | null;
      filesModified: string[] | null;
    };
  };
  index: number;
}

export const VariantCard = ({ variant, index }: VariantCardProps) => {
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

  const codeAgent = variant.codeAgent;
  const status = codeAgent?.status || 'pending';
  const config = codeAgentStatusConfig[status];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1">
            <div className="bg-neutral-100 text-neutral-600 rounded w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs font-medium mt-0.5">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm leading-tight">{variant.suggestion || 'Variant'}</CardTitle>
            </div>
          </div>
          <div className="flex items-center gap-1 text-neutral-500 flex-shrink-0">
            {config.icon}
            <span className="text-xs">{config.label}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {variant.analysis && (
          <div>
            <p className="text-xs text-neutral-500 mb-1.5">Analysis Summary</p>
            <p className="text-xs text-neutral-700 leading-relaxed">
              {variant.analysis.summary}
            </p>
          </div>
        )}

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

            {/* Implementation Summary */}
            {codeAgent.implementationSummary && (
              <div>
                <p className="text-xs text-neutral-500 mb-1.5">Implementation</p>
                <p className="text-xs text-neutral-700 leading-relaxed">
                  {codeAgent.implementationSummary}
                </p>
              </div>
            )}

            {/* Files Modified */}
            {codeAgent.filesModified && codeAgent.filesModified.length > 0 && (
              <div>
                <p className="text-xs text-neutral-500 mb-1.5">Files Modified</p>
                <div className="space-y-1">
                  {codeAgent.filesModified.slice(0, 3).map((file, idx) => (
                    <p key={idx} className="text-xs text-neutral-600 font-mono bg-neutral-50 p-1 rounded">
                      {file}
                    </p>
                  ))}
                  {codeAgent.filesModified.length > 3 && (
                    <p className="text-xs text-neutral-500">
                      +{codeAgent.filesModified.length - 3} more files
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {variant.publicUrl && (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start h-8"
                  onClick={() => window.open(variant.publicUrl, '_blank')}
                >
                  <RiExternalLinkLine size={12} className="mr-2" />
                  View Preview
                </Button>
              </div>
            )}

            {/* Status Messages */}
            {codeAgent.status === 'running' && (
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
