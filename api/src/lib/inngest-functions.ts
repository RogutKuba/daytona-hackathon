import { runExperimentJob } from '@/service/experiment/Experiment.jobs';
import { implementVariantJob } from '@/service/codeAgent/CodeAgent.jobs';

// Export all Inngest functions
export const INNGEST_FUNCTIONS = [runExperimentJob, implementVariantJob];
