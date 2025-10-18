import { RiFlaskLine, RiGitBranchLine, RiTargetLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ExperimentFormData {
  repoUrl: string;
  goal: string;
}

interface ExperimentFormProps {
  formData: ExperimentFormData;
  onFormDataChange: (data: ExperimentFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ExperimentForm({ formData, onFormDataChange, onSubmit, onCancel, isSubmitting = false }: ExperimentFormProps) {
  return (
    <Card className="max-w-2xl mx-auto border-2">
      <CardHeader>
        <CardTitle className="text-2xl">New Experiment Configuration</CardTitle>
        <CardDescription className="text-base">
          Configure your experiment parameters to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Git Repository URL */}
          <div className="space-y-2">
            <Label htmlFor="repoUrl" className="text-base font-semibold flex items-center gap-2">
              <RiGitBranchLine className="h-4 w-4" />
              Git Repository URL
            </Label>
            <Input
              id="repoUrl"
              type="url"
              placeholder="https://github.com/username/repository"
              value={formData.repoUrl}
              onChange={(e) => onFormDataChange({ ...formData, repoUrl: e.target.value })}
              required
              className="h-11"
            />
            <p className="text-sm text-muted-foreground">
              Source code for the application to be optimized
            </p>
          </div>

          {/* Task / Prompt */}
          <div className="space-y-2">
            <Label htmlFor="goal" className="text-base font-semibold flex items-center gap-2">
              <RiTargetLine className="h-4 w-4" />
              Task / Prompt
            </Label>
            <Textarea
              id="goal"
              placeholder="Describe what you want the AI to do... e.g., Increase signup conversion, Fix layout bugs, Improve user engagement"
              value={formData.goal}
              onChange={(e) => onFormDataChange({ ...formData, goal: e.target.value })}
              required
              className="min-h-[200px] resize-y"
            />
            <p className="text-sm text-muted-foreground">
              Describe what you want the AI to optimize or improve
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" size="lg" className="flex-1 gap-2" disabled={isSubmitting}>
              <RiFlaskLine className="h-5 w-5" />
              {isSubmitting ? "Starting..." : "Start Experiment"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
