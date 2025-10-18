import { browserUse } from '@/lib/browser-use';
import { TaskStepView } from 'browser-use-sdk/dist/cjs/api';

export abstract class BrowserService {
  /**
   * Create and run a browser automation task
   * @param task - The task description/instructions for the browser agent
   * @param url - Optional starting URL for the task
   * @returns The created task with ID and live URL
   */
  static async createTask(task: string, url?: string) {
    const taskData = await browserUse.tasks.createTask({
      task,
      startUrl: url,
    });

    return taskData;
  }

  /**
   * Wait for a task to complete and return the result
   * @param taskId - The task ID to wait for
   * @param maxWaitTime - Maximum time to wait in milliseconds (default: 5 minutes)
   * @returns The completed task data
   */
  static async waitForTaskCompletion(
    taskId: string,
    maxWaitTime: number = 5 * 60 * 1000
  ) {
    const startTime = Date.now();
    const pollInterval = 3000; // Poll every 3 seconds

    while (Date.now() - startTime < maxWaitTime) {
      const task = await browserUse.tasks.getTask(taskId);

      if (task.status === 'finished' || task.status === 'stopped') {
        return task;
      }

      // Wait before polling again
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    throw new Error(`Task ${taskId} did not complete within ${maxWaitTime}ms`);
  }

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
