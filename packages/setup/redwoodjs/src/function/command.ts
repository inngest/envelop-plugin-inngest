import type Yargs from 'yargs';

interface BaseOptions {
  cwd: string | undefined;
}

export interface ForceOptions extends BaseOptions {
  force: boolean;
}

export interface SetupInngestFunctionOptions extends ForceOptions {
  name: string;
  type: 'background' | 'scheduled' | 'delayed' | 'step';
}

export const description = 'Set up an Inngest function';

export const builder = (yargs: Yargs.Argv) => {
  return yargs
    .positional('name', { type: 'string', description: 'Name of the function to setup' })
    .option('type', {
      alias: 't',
      type: 'string',
      choices: ['background', 'scheduled', 'delayed', 'step'],
      description: 'Type of Inngest function to setup',
      default: 'background',
    })
    .option('force', {
      alias: 'f',
      default: true,
      description: 'Overwrite existing files',
      type: 'boolean',
    });
};

export const handler = async (options: any) => {
  const { handler } = await import('./handler');
  return handler(options);
};
