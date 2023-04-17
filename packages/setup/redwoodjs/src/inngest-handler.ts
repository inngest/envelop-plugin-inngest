import { colors } from '@redwoodjs/cli-helpers';
import { setupPluginTasks } from './setup-plugin-tasks';
import type { SetupPluginTasksOptions } from './setup-plugin-tasks';
interface ErrorWithExitCode extends Error {
  exitCode?: number;
}

function isErrorWithExitCode(e: unknown): e is ErrorWithExitCode {
  return typeof (e as ErrorWithExitCode)?.exitCode !== 'undefined';
}

export const handler = async ({ cwd, force }: SetupPluginTasksOptions) => {
  const tasks = setupPluginTasks({ cwd, force });

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
