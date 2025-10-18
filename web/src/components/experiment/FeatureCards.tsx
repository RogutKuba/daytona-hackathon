import { RiGitBranchLine, RiTargetLine, RiLineChartLine } from "@remixicon/react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function FeatureCards() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <RiGitBranchLine className="h-8 w-8 mb-2 text-primary" />
          <CardTitle className="text-lg">Repository Integration</CardTitle>
          <CardDescription>
            Connect your GitHub repository and let AI generate optimized variants
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <RiTargetLine className="h-8 w-8 mb-2 text-primary" />
          <CardTitle className="text-lg">Goal-Driven Testing</CardTitle>
          <CardDescription>
            Define your objectives and let AI optimize for your specific goals
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <RiLineChartLine className="h-8 w-8 mb-2 text-primary" />
          <CardTitle className="text-lg">Automated Optimization</CardTitle>
          <CardDescription>
            Browser agents test variants and merge winning changes automatically
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
