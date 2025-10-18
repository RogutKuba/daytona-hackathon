"use client";

import { useState } from "react";
import { ExperimentHeader } from "./ExperimentHeader";
import { WelcomeCard } from "./WelcomeCard";
import { FeatureCards } from "./FeatureCards";
import { ExperimentForm } from "./ExperimentForm";
import { useStartExperimentMutation } from "@/query/experiment.query";

export function DashboardContainer() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    repoUrl: "",
    goal: "",
  });

  const { startExperiment, isPending } = useStartExperimentMutation();

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
