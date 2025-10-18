import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RiRobotLine, RiExternalLinkLine, RiCheckboxCircleLine, RiErrorWarningLine } from '@remixicon/react';

interface AgentCardProps {
  agent: {
    id: string;
    variantId?: string;
    status: string;
    taskPrompt?: string;
    browserLiveUrl?: string;
    result?: {
      success: boolean;
      summary?: string;
      insights?: string[];
      issues?: string[];
    };
  };
  variantName?: string;
}

export const AgentCard = ({ agent, variantName }: AgentCardProps) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    running: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    failed: 'bg-red-100 text-red-800 border-red-200',
  };

  const statusColor = statusColors[agent.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 border-gray-200';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <RiRobotLine size={18} className="text-neutral-600" />
            <CardTitle className="text-sm">
              Agent {agent.id.slice(0, 8)}
            </CardTitle>
          </div>
          <span className={`px-2 py-1 rounded-md text-xs font-medium border ${statusColor}`}>
            {agent.status}
          </span>
        </div>
        {variantName && (
          <p className="text-xs text-neutral-500 mt-1">Testing: {variantName}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {agent.taskPrompt && (
          <div>
            <p className="text-xs font-medium text-neutral-700 mb-1">Task:</p>
            <p className="text-sm text-neutral-600">{agent.taskPrompt}</p>
          </div>
        )}

        {agent.result && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {agent.result.success ? (
                <RiCheckboxCircleLine size={16} className="text-green-600" />
              ) : (
                <RiErrorWarningLine size={16} className="text-red-600" />
              )}
              <p className="text-xs font-medium text-neutral-700">
                {agent.result.success ? 'Completed Successfully' : 'Completed with Issues'}
              </p>
            </div>

            {agent.result.summary && (
              <p className="text-sm text-neutral-600">{agent.result.summary}</p>
            )}

            {agent.result.insights && agent.result.insights.length > 0 && (
              <div>
                <p className="text-xs font-medium text-neutral-700 mb-1">Insights:</p>
                <ul className="list-disc list-inside space-y-1">
                  {agent.result.insights.map((insight, idx) => (
                    <li key={idx} className="text-xs text-neutral-600">{insight}</li>
                  ))}
                </ul>
              </div>
            )}

            {agent.result.issues && agent.result.issues.length > 0 && (
              <div>
                <p className="text-xs font-medium text-red-700 mb-1">Issues:</p>
                <ul className="list-disc list-inside space-y-1">
                  {agent.result.issues.map((issue, idx) => (
                    <li key={idx} className="text-xs text-red-600">{issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {agent.browserLiveUrl && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => window.open(agent.browserLiveUrl, '_blank')}
          >
            <RiExternalLinkLine size={16} className="mr-2" />
            View Live Session
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
