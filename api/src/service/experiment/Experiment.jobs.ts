import { ExperimentEntity } from '@/db/experiment.db';
import { inngestClient } from '@/lib/inngest-client';
import { ExperimentService } from '@/service/experiment/Experiment.service';

export interface ExperimentRunJobData {
  experiment: ExperimentEntity;
}

const EXPERIMENT_RUN_JOB_ID = 'run-experiment';

export const runExperimentJob = inngestClient.createFunction(
  { id: EXPERIMENT_RUN_JOB_ID },
  { event: 'experiment/run' },
  async ({ event, step }) => {
    // const { experiment } = event.data as ExperimentRunJobData;
    const experiment: ExperimentEntity = {
      id: 'test' as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      repoUrl: 'https://github.com/RogutKuba/fake-ecommerce',
      goal: 'Test the shirt',
      status: 'pending',
    };

    //  init repository
    const sandboxResult = await step.run('init-repo', async () => {
      console.log(
        `Creating sandbox for experiment ${experiment.id} with repo ${experiment.repoUrl}`
      );

      return await ExperimentService.initRepository(experiment.repoUrl);
    });
  }
);

export const createExperimentJob = async (data: ExperimentRunJobData) => {
  await inngestClient.send({
    name: EXPERIMENT_RUN_JOB_ID,
    data: data,
  });
};
