import prompts from 'prompts';

import { colors } from '@redwoodjs/cli-helpers';

import { tasks as setupFunctionTasks } from './tasks';
import type { SetupFunctionTasksOptions } from './tasks';

interface ErrorWithExitCode extends Error {
  exitCode?: number;
}

function isErrorWithExitCode(e: unknown): e is ErrorWithExitCode {
  return typeof (e as ErrorWithExitCode)?.exitCode !== 'undefined';
}

export const handler = async ({ cwd, force, name, type }: SetupFunctionTasksOptions) => {
  let functionType = type;

  // Prompt to select what type if not specified
  if (!functionType) {
    const response = await prompts({
      type: 'select',
      name: 'functionType',
      choices: [
        { value: 'background', title: 'Background', description: 'Create a background function triggered by an event' },
        {
          value: 'scheduled',
          title: 'Scheduled',
          description: 'Create a scheduled function to run at a specific time',
        },
        {
          value: 'delayed',
          title: 'Delayed',
          description: 'Create a delayed function to run after a specified duration',
        },
        {
          value: 'step',
          title: 'Multi-Step',
          description:
            'Create a multi-step function to safely coordinate between events, delay execution for hours or days, and consider previous steps and incoming events',
        },
      ],
      message: 'What type of Inngest function would you like to create?',
    });

    functionType = response.functionType;
  }

  const tasks = setupFunctionTasks({ cwd, force, name, type: functionType });

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
