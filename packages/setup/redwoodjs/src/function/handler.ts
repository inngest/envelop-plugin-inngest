import fs from 'fs';
import path from 'path';
import prompts from 'prompts';
import { colors, getPaths } from '@redwoodjs/cli-helpers';
import { tasks as setupFunctionTasks } from './tasks';
import type { SetupFunctionTasksOptions } from './tasks';

interface ErrorWithExitCode extends Error {
  exitCode?: number;
}

type ExportedType = {
  name: string;
  type: string;
  operationType: 'query' | 'mutation';
};

function isErrorWithExitCode(e: unknown): e is ErrorWithExitCode {
  return typeof (e as ErrorWithExitCode)?.exitCode !== 'undefined';
}

function getExportedQueryAndMutationTypes(filePath: string): ExportedType[] {
  const fileContents = fs.readFileSync(filePath, 'utf-8');

  const exportedTypes: ExportedType[] = [];

  // Extract exported types
  const typeRegex =
    /export\s+type\s+(\w+)\s+=\s+{[^}]*__typename\?:\s+['"](?:Query|Mutation)['"][^}]*}/g;

  let match;
  while ((match = typeRegex.exec(fileContents)) !== null) {
    if (!['Mutation', 'Query'].includes(match[1])) {
      const name = match[1];
      const type = match[0];
      const operationType = type.includes("__typename?: 'Query'") ? 'query' : 'mutation';
      exportedTypes.push({ name, type, operationType });
    }
  }

  // Filter exported types with __typename of Query or Mutation
  const filteredTypes = exportedTypes.filter(type => type.operationType === 'query' || 'mutation');

  return filteredTypes.sort((a, b) => {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  });
}

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
      ],
      message: 'What type of Inngest function would you like to create?',
    });

    functionType = response.functionType;
  }

  // If GraphQL is specified, the scheduled function does not have an event name.
  if (graphql && functionType !== 'scheduled') {
    const GRAPHQL_TYPES_PATH = path.join(getPaths().web.types, 'graphql.d.ts');

    const operationTypesForEvent = getExportedQueryAndMutationTypes(GRAPHQL_TYPES_PATH);

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
