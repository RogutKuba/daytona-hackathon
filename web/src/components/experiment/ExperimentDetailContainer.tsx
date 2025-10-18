'use client';

import { useExperimentDetailQuery } from '@/query/experiment.query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ControlVariantCard } from './ControlVariantCard';
import { VariantCard } from './VariantCard';
import {
  RiFlaskLine,
  RiArrowLeftLine,
  RiGitRepositoryLine,
  RiTargetLine,
} from '@remixicon/react';
import Link from 'next/link';

interface ExperimentDetailContainerProps {
  experimentId: string;
}

export const ExperimentDetailContainer = ({ experimentId }: ExperimentDetailContainerProps) => {
  const { experiment, isLoading, isError } = useExperimentDetailQuery(experimentId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <RiFlaskLine size={48} className="mx-auto mb-4 text-neutral-400 animate-pulse" />
          <p className="text-neutral-600">Loading experiment details...</p>
        </div>
      </div>
    );
  }

  if (isError || !experiment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Experiment Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-600 mb-4">
              The experiment you're looking for doesn't exist or has been deleted.
            </p>
            <Link href="/">
              <Button>
                <RiArrowLeftLine size={16} className="mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusLabels = {
    pending: 'Pending',
    running: 'Running',
    completed: 'Completed',
    failed: 'Failed',
  };

  const statusLabel = statusLabels[experiment.status] || experiment.status;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <RiArrowLeftLine size={16} className="mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">Experiment</h1>
              <span className="text-neutral-400">•</span>
              <span className="text-sm text-neutral-500">{statusLabel}</span>
            </div>
          </div>
        </div>

        {/* Experiment Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RiTargetLine size={20} />
              Experiment Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <RiGitRepositoryLine size={18} className="text-neutral-600" />
                <p className="text-sm font-medium text-neutral-700">Repository</p>
              </div>
              <p className="text-sm text-neutral-600 font-mono bg-neutral-50 p-2 rounded">
                {experiment.repoUrl}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <RiTargetLine size={18} className="text-neutral-600" />
                <p className="text-sm font-medium text-neutral-700">Goal</p>
              </div>
              <p className="text-sm text-neutral-600">{experiment.goal}</p>
            </div>

            <div className="flex gap-6 text-sm">
              <div>
                <p className="text-neutral-500">Created</p>
                <p className="font-medium">
                  {new Date(experiment.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-neutral-500">Last Updated</p>
                <p className="font-medium">
                  {new Date(experiment.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>

            {experiment.variantSuggestions && experiment.variantSuggestions.length > 0 && (
              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-neutral-700 mb-2">Variant Suggestions</p>
                <ul className="list-disc list-inside space-y-1">
                  {experiment.variantSuggestions.map((suggestion, idx) => (
                    <li key={idx} className="text-sm text-neutral-600">
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Control Variant Section */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-neutral-600">Control Variant</h2>
          {experiment.controlVariant ? (
            <ControlVariantCard controlVariant={experiment.controlVariant} />
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-sm text-neutral-500">
                  Setting up control variant...
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Variants Section */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-neutral-600">
            Experimental Variants
            {experiment.experimentalVariants && (
              <span className="text-neutral-400 font-normal ml-1">
                ({experiment.experimentalVariants.length})
              </span>
            )}
          </h2>
          {experiment.experimentalVariants && experiment.experimentalVariants.length > 0 ? (
            <div className="space-y-3">
              {experiment.experimentalVariants.map((variant, index) => (
                <VariantCard
                  key={variant.id}
                  variant={variant}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-sm text-neutral-500">
                  Generating experimental variants...
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
