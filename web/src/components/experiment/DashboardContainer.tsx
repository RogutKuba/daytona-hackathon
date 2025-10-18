"use client";

import { useState } from "react";
import { ExperimentHeader } from "./ExperimentHeader";
import { WelcomeCard } from "./WelcomeCard";
import { FeatureCards } from "./FeatureCards";
import { ExperimentForm } from "./ExperimentForm";
import { ExperimentListCard } from "./ExperimentListCard";
import { useStartExperimentMutation, useExperimentsQuery } from "@/query/experiment.query";
import { Card, CardContent } from "@/components/ui/card";
import { RiFlaskLine, RiLoader4Line } from "@remixicon/react";

export function DashboardContainer() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    repoUrl: "",
    goal: "",
  });

  const { startExperiment, isPending } = useStartExperimentMutation();
  const { experiments, isLoading: isLoadingExperiments } = useExperimentsQuery();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startExperiment(formData, {
      onSuccess: (data) => {
        console.log("Experiment started successfully:", data);
        // Reset form and hide it
        setFormData({ repoUrl: "", goal: "" });
        setShowForm(false);
      },
      onError: (error) => {
        console.error("Failed to start experiment:", error);
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <div className="container mx-auto px-4 py-8">
        <ExperimentHeader />

        {!showForm ? (
          <div className="space-y-6">
            <WelcomeCard onNewExperiment={() => setShowForm(true)} />

            {/* Experiments List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-neutral-900 flex items-center gap-2">
                  <RiFlaskLine size={24} className="text-neutral-700" />
                  Your Experiments
                  {experiments && (
                    <span className="text-base text-neutral-500 font-normal">
                      ({experiments.length})
                    </span>
                  )}
                </h2>
              </div>

              {isLoadingExperiments ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <RiLoader4Line size={32} className="mx-auto mb-3 text-neutral-400 animate-spin" />
                    <p className="text-sm text-neutral-500">Loading experiments...</p>
                  </CardContent>
                </Card>
              ) : experiments && experiments.length > 0 ? (
                <div className="grid gap-4">
                  {experiments.map((experiment) => (
                    <ExperimentListCard key={experiment.id} experiment={experiment} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <RiFlaskLine size={48} className="mx-auto mb-3 text-neutral-300" />
                    <h3 className="text-base font-semibold text-neutral-700 mb-1">
                      No experiments yet
                    </h3>
                    <p className="text-sm text-neutral-500">
                      Get started by creating your first experiment above!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            <FeatureCards />
          </div>
        ) : (
          <ExperimentForm
            formData={formData}
            onFormDataChange={setFormData}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
            isSubmitting={isPending}
          />
        )}
      </div>
    </div>
  );
}
