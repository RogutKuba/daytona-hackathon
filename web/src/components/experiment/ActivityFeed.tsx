import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RiTimeLine, RiLightbulbLine, RiTerminalLine } from '@remixicon/react';

interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'log' | 'thinking' | 'event';
  message: string;
  metadata?: Record<string, any>;
}

interface ActivityFeedProps {
  logs?: ActivityLog[];
}

// Placeholder data for demonstration
const placeholderLogs: ActivityLog[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 5000).toISOString(),
    type: 'event',
    message: 'Experiment started',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 4500).toISOString(),
    type: 'log',
    message: 'Cloning repository from GitHub...',
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 4000).toISOString(),
    type: 'log',
    message: 'Creating Daytona sandboxes for variants...',
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 3500).toISOString(),
    type: 'thinking',
    message: 'Analyzing codebase structure to identify optimization opportunities...',
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 3000).toISOString(),
    type: 'thinking',
    message: 'Identified CTA button as primary conversion point. Generating variants with different colors and text.',
  },
  {
    id: '6',
    timestamp: new Date(Date.now() - 2500).toISOString(),
    type: 'event',
    message: 'Variant A deployed to sandbox',
  },
  {
    id: '7',
    timestamp: new Date(Date.now() - 2000).toISOString(),
    type: 'event',
    message: 'Variant B deployed to sandbox',
  },
  {
    id: '8',
    timestamp: new Date(Date.now() - 1500).toISOString(),
    type: 'log',
    message: 'Launching browser agents for testing...',
  },
  {
    id: '9',
    timestamp: new Date(Date.now() - 1000).toISOString(),
    type: 'thinking',
    message: 'Agents will simulate user interactions including scroll, hover, and click patterns.',
  },
  {
    id: '10',
    timestamp: new Date(Date.now() - 500).toISOString(),
    type: 'event',
    message: 'Agent testing in progress on Variant A',
  },
];

export const ActivityFeed = ({ logs = placeholderLogs }: ActivityFeedProps) => {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getIcon = (type: ActivityLog['type']) => {
    switch (type) {
      case 'thinking':
        return <RiLightbulbLine size={16} className="text-purple-600" />;
      case 'log':
        return <RiTerminalLine size={16} className="text-blue-600" />;
      case 'event':
        return <RiTimeLine size={16} className="text-green-600" />;
      default:
        return <RiTimeLine size={16} className="text-neutral-600" />;
    }
  };

  const getTypeColor = (type: ActivityLog['type']) => {
    switch (type) {
      case 'thinking':
        return 'bg-purple-50 border-l-purple-500';
      case 'log':
        return 'bg-blue-50 border-l-blue-500';
      case 'event':
        return 'bg-green-50 border-l-green-500';
      default:
        return 'bg-neutral-50 border-l-neutral-500';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Activity Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-sm text-neutral-500 text-center py-8">
              No activity yet. Logs and thinking will appear here as the experiment runs.
            </p>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className={`p-3 rounded-lg border-l-4 ${getTypeColor(log.type)}`}
              >
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">{getIcon(log.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-neutral-500">
                        {formatTimestamp(log.timestamp)}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-700 uppercase tracking-wide">
                        {log.type}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-700">{log.message}</p>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="mt-2 text-xs text-neutral-500 font-mono bg-neutral-100 p-2 rounded">
                        {JSON.stringify(log.metadata, null, 2)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
