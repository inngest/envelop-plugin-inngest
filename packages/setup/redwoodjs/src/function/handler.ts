import prompts from 'prompts';
import { colors } from '@redwoodjs/cli-helpers';
import { getExportedQueryAndMutationTypes } from './helpers';
import { tasks as setupFunctionTasks } from './tasks';
import type { SetupFunctionTasksOptions } from './types';

interface ErrorWithExitCode extends Error {
  exitCode?: number;
}

const isErrorWithExitCode = (e: unknown): e is ErrorWithExitCode => {
  return typeof (e as ErrorWithExitCode)?.exitCode !== 'undefined';
};

export const handler = async ({
  cwd,
  force,
  name,
  type,
  graphql,
  eventName,
  operationType,
}: SetupFunctionTasksOptions) => {
  let functionType = type;
  eventName = name;

  // Prompt to select what type if not specified
  if (!functionType) {
    const response = await prompts({
      type: 'select',
      name: 'functionType',
      choices: [
        {
          value: 'background',
          title: 'Background',
          description: 'Create a background function triggered by an event',
        },
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
        {
          value: 'fan-out',
          title: 'Fan Out',
          description: 'Create a fan out function to call other functions, which run in parallel',
        },
      ],
      message: 'What type of Inngest function would you like to create?',
    });

    functionType = response.functionType;
  }

  // If GraphQL is specified, the scheduled function does not have an event name.
  if (graphql && functionType !== 'scheduled') {
    const operationTypesForEvent = getExportedQueryAndMutationTypes();

    const graphqlOperationChoices = operationTypesForEvent.map(op => ({
      value: op,
      title: op.name,
      description: `Create a function for the ${op.operationType} ${op.name}`,
    }));

    const response = await prompts({
      type: 'select',
      name: 'graphQLOperation',
      choices: graphqlOperationChoices,
      message: 'What GraphQL operation event should your function handle?',
    });

    // eslint-disable-next-line no-console
    console.debug(response.graphQLOperation.name, 'Make function for this event');

    operationType = response.graphQLOperation.operationType;
    eventName = response.graphQLOperation.name;
  }

  const tasks = setupFunctionTasks({
    cwd,
    force,
    name,
    type: functionType,
    graphql,
    eventName,
    operationType,
  });

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
