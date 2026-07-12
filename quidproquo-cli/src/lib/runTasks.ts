export type Task = { label: string; run: () => Promise<void> };
export type TaskFailure = { label: string; error: Error };

// Run tasks with at most `limit` in flight; never rejects — failures come back
// labelled so a whole wave can finish before we report what broke.
export const runTasks = async (tasks: Task[], limit: number): Promise<TaskFailure[]> => {
  const failures: TaskFailure[] = [];
  let nextIndex = 0;

  const workerCount = Math.max(1, Math.min(limit, tasks.length));
  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (nextIndex < tasks.length) {
        const task = tasks[nextIndex];
        nextIndex += 1;
        try {
          await task.run();
        } catch (error) {
          failures.push({ label: task.label, error: error as Error });
        }
      }
    }),
  );

  return failures;
};

export const assertNoFailures = (phaseName: string, failures: TaskFailure[]): void => {
  if (failures.length === 0) return;
  console.error(`\n${phaseName} failed for:`);
  failures.forEach((failure) => console.error(`  ${failure.label}: ${failure.error.message}`));
  throw new Error(`${phaseName}: ${failures.length} task(s) failed`);
};
