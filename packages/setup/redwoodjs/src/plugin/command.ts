import type Yargs from 'yargs';

interface BaseOptions {
  cwd: string | undefined;
}

export interface ForceOptions extends BaseOptions {
  force: boolean;
}

export const description = 'Set up Inngest plugin';

export const builder = (yargs: Yargs.Argv<BaseOptions>) => {
  return yargs.option('force', {
    alias: 'f',
    default: true,
    description: 'Overwrite existing files',
    type: 'boolean',
  });
};

export const handler = async (options: ForceOptions) => {
  // setup plugin
  // eslint-disable-next-line no-console
  console.debug('setup plugin', options);
  const { handler } = await import('./handler');
  return handler(options);
};
