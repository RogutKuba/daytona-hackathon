import { RiFlaskLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface WelcomeCardProps {
  onNewExperiment: () => void;
}

export function WelcomeCard({ onNewExperiment }: WelcomeCardProps) {
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome to the Experiment Platform</CardTitle>
        <CardDescription className="text-base">
          Start a new experiment to automatically optimize your application with AI-powered testing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onNewExperiment} size="lg" className="gap-2">
          <RiFlaskLine className="h-5 w-5" />
          New Experiment
        </Button>
      </CardContent>
    </Card>
  );
}
