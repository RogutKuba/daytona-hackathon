import { browserUse } from '@/lib/browser-use';
import { TaskStepView } from 'browser-use-sdk/dist/cjs/api';

export abstract class BrowserService {
  /**
   * Get the steps of the task, including some thinking, but includes screenshots
   * @param taskId
   * @returns
   */
  static async getTaskSteps(taskId: string): Promise<TaskStepView[]> {
    const task = await browserUse.tasks.getTask(taskId);
    return task.steps;
  }

  /**
   * Get the raw txt file with the full task logs and thinking process
   * @param taskId
   * @returns raw txt file with the full task logs and thinking process
   */
  static async getTaskLogs(taskId: string) {
    const { downloadUrl } = await browserUse.tasks.getTaskLogs(taskId);
    const response = await fetch(downloadUrl);
    const text = await response.text();
    return text;
  }
}
