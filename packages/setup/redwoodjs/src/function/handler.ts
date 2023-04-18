import { colors } from '@redwoodjs/cli-helpers';

import { tasks as setupPluginTasks } from './tasks';
import type { SetupFunctionTasksOptions } from './tasks';

interface ErrorWithExitCode extends Error {
  exitCode?: number;
}

function isErrorWithExitCode(e: unknown): e is ErrorWithExitCode {
  return typeof (e as ErrorWithExitCode)?.exitCode !== 'undefined';
}

export const handler = async ({ cwd, force, name, type }: SetupFunctionTasksOptions) => {
  const tasks = setupPluginTasks({ cwd, force, name, type });

  try {
    await tasks.run();
  } catch (e) {
    if (e instanceof Error) {
      // eslint-disable-next-line no-console
      console.error(colors.error(e.message));
    } else {
      // eslint-disable-next-line no-console
      console.error(colors.error('Unknown error when running yargs tasks'));
    }

    if (isErrorWithExitCode(e)) {
      process.exit(e.exitCode);
    }

    process.exit(1);
  }
};
