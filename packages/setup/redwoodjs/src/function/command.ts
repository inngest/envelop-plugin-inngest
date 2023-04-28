import type Yargs from 'yargs';

interface BaseOptions {
  cwd: string | undefined;
}

export interface ForceOptions extends BaseOptions {
  force: boolean;
}

export interface SetupInngestFunctionOptions extends ForceOptions {
  name: string;
  eventName?: string;
  type: 'background' | 'scheduled' | 'delayed' | 'step' | 'fan-out';
  graphql: boolean;
  operationType?: 'query' | 'mutation';
}

export const command = 'inngest-setup-redwoodjs function';
export const description = 'Set up an Inngest function';

export const builder = (yargs: Yargs.Argv) => {
  return yargs
    .scriptName('inngest-setup-redwoodjs')
    .positional('name', { type: 'string', description: 'Name of the function to setup' })
    .option('eventName', {
      aliases: ['e', 'event', 'eventName'],
      default: undefined,
      description: 'Name of the event to trigger the function. Defaults to the function name.',
      type: 'string',
    })
    .option('graphql', {
      aliases: ['g', 'graphql', 'gql'],
      default: false,
      description: 'Build event name from your web side GraphQL operations',
      type: 'boolean',
    })
    .option('type', {
      alias: 't',
      type: 'string',
      choices: ['background', 'scheduled', 'delayed', 'step'],
      description: 'Type of Inngest function to setup',
    })
    .option('force', {
      alias: 'f',
      default: false,
      description: 'Overwrite existing files',
      type: 'boolean',
    });
};

export const handler = async (options: any) => {
  const { handler } = await import('./handler');
  return handler({ ...options, operationType: undefined });
};
