import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RiExternalLinkLine, RiLoader4Line } from '@remixicon/react';

interface ControlVariantCardProps {
  controlVariant: {
    id: string;
    daytonaSandboxId: string;
    publicUrl: string;
    analysis: {
      success: boolean;
      summary: string;
      insights: string[];
      issues: string[];
    } | null;
    browserAgent?: {
      id: string;
      taskPrompt: string;
      status: 'pending' | 'running' | 'completed' | 'failed';
      browserLiveUrl: string | null;
      result: {
        success: boolean;
        summary: string;
        insights?: string;
        issues?: string;
      } | null;
      rawLogs: string | null;
    };
  };
}

export const ControlVariantCard = ({
  controlVariant,
}: ControlVariantCardProps) => {
  // Use variant analysis if available, otherwise fall back to agent result
  const analysis =
    controlVariant.analysis || controlVariant.browserAgent?.result;

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-sm'>Control Variant</CardTitle>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Public URL */}
        <div>
          <p className='text-sm font-medium text-neutral-700 mb-2'>
            Preview URL
          </p>
          <Button
            variant='outline'
            size='sm'
            className='w-full justify-start font-mono text-sm h-9'
            onClick={() => window.open(controlVariant.publicUrl, '_blank')}
          >
            <RiExternalLinkLine size={14} className='mr-2 flex-shrink-0' />
            <span className='truncate'>{controlVariant.publicUrl}</span>
          </Button>
        </div>

        {/* Browser Agent Section */}
        {controlVariant.browserAgent && (
          <div className='pt-4 border-t space-y-4'>
            <div>
              <p className='text-sm font-medium text-neutral-700 mb-2'>
                Browser Agent Task
              </p>
              <p className='text-sm text-neutral-700 bg-neutral-50 p-3 rounded border leading-relaxed'>
                {controlVariant.browserAgent.taskPrompt}
              </p>
            </div>

            {/* Live URL */}
            {controlVariant.browserAgent.browserLiveUrl && (
              <Button
                variant='outline'
                size='sm'
                className='w-full h-9'
                onClick={() =>
                  window.open(
                    controlVariant.browserAgent?.browserLiveUrl!,
                    '_blank'
                  )
                }
              >
                <RiExternalLinkLine size={14} className='mr-2' />
                View Browser Session
              </Button>
            )}

            {/* Analysis */}
            {analysis && (
              <div className='space-y-4'>
                <div>
                  <p className='text-sm font-medium text-neutral-700 mb-2'>
                    Analysis Summary
                  </p>
                  <p className='text-sm text-neutral-700 bg-neutral-50 p-3 rounded border leading-relaxed'>
                    {analysis.summary}
                  </p>
                </div>

                {/* Insights */}
                {analysis?.insights && (
                  <div>
                    <p className='text-sm font-medium text-neutral-700 mb-2'>
                      Insights
                    </p>
                    <ul className='space-y-2'>
                      <li className='text-sm text-neutral-700 flex items-start gap-2'>
                        <span className='text-neutral-400 mt-1'>•</span>
                        <span className='flex-1'>{analysis.insights}</span>
                      </li>
                    </ul>
                  </div>
                )}

                {/* Issues */}
                {analysis?.issues && (
                  <div>
                    <p className='text-sm font-medium text-neutral-700 mb-2'>
                      Issues
                    </p>
                    <ul className='space-y-2'>
                      <li className='text-sm text-neutral-700 flex items-start gap-2'>
                        <span className='text-neutral-400 mt-1'>•</span>
                        <span className='flex-1'>{analysis.issues}</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Running state */}
            {controlVariant.browserAgent.status === 'running' && (
              <div className='flex items-center gap-2 text-neutral-600 bg-neutral-50 p-3 rounded border'>
                <RiLoader4Line size={16} className='animate-spin' />
                <p className='text-sm'>Analyzing...</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
