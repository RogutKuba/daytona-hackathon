import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  RiExternalLinkLine,
  RiLoader4Line,
} from '@remixicon/react';

interface ControlVariantCardProps {
  controlVariant: {
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
  };
}

export const ControlVariantCard = ({ controlVariant }: ControlVariantCardProps) => {
  const analysis = controlVariant.browserAgent?.analysis;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Control Variant</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Public URL */}
        <div>
          <p className="text-xs text-neutral-500 mb-1.5">Preview URL</p>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start font-mono text-xs h-8"
            onClick={() => window.open(controlVariant.publicUrl, '_blank')}
          >
            <RiExternalLinkLine size={12} className="mr-2 flex-shrink-0" />
            <span className="truncate">{controlVariant.publicUrl}</span>
          </Button>
        </div>

        {/* Browser Agent Section */}
        {controlVariant.browserAgent && (
          <div className="pt-3 border-t space-y-3">
            <div>
              <p className="text-xs text-neutral-500 mb-1.5">Browser Agent Task</p>
              <p className="text-xs text-neutral-700 bg-neutral-50 p-2 rounded border">
                {controlVariant.browserAgent.taskPrompt}
              </p>
            </div>

            {/* Live URL */}
            {controlVariant.browserAgent.liveUrl && (
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8"
                onClick={() => window.open(controlVariant.browserAgent?.liveUrl, '_blank')}
              >
                <RiExternalLinkLine size={12} className="mr-2" />
                View Browser Session
              </Button>
            )}

            {/* Analysis */}
            {analysis && (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-neutral-500 mb-1.5">Analysis</p>
                  <p className="text-xs text-neutral-700 bg-neutral-50 p-2 rounded border">
                    {analysis.summary}
                  </p>
                </div>

                {/* Insights */}
                {analysis.insights.length > 0 && (
                  <div>
                    <p className="text-xs text-neutral-500 mb-1.5">Insights</p>
                    <ul className="space-y-1">
                      {analysis.insights.map((insight, idx) => (
                        <li key={idx} className="text-xs text-neutral-700 flex items-start gap-1.5">
                          <span className="text-neutral-400 mt-0.5">•</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Issues */}
                {analysis.issues.length > 0 && (
                  <div>
                    <p className="text-xs text-neutral-500 mb-1.5">Issues</p>
                    <ul className="space-y-1">
                      {analysis.issues.map((issue, idx) => (
                        <li key={idx} className="text-xs text-neutral-700 flex items-start gap-1.5">
                          <span className="text-neutral-400 mt-0.5">•</span>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggestions */}
                {analysis.suggestions && analysis.suggestions.length > 0 && (
                  <div>
                    <p className="text-xs text-neutral-500 mb-1.5">Suggestions</p>
                    <ul className="space-y-1">
                      {analysis.suggestions.map((suggestion, idx) => (
                        <li key={idx} className="text-xs text-neutral-700 flex items-start gap-1.5">
                          <span className="text-neutral-400 mt-0.5">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Running state */}
            {controlVariant.browserAgent.status === 'running' && (
              <div className="flex items-center gap-2 text-neutral-600 bg-neutral-50 p-2 rounded border">
                <RiLoader4Line size={14} className="animate-spin" />
                <p className="text-xs">Analyzing...</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
