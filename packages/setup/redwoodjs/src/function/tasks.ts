// import fs from 'fs-extra';
import path from 'path';

// import execa from 'execa';
import { Listr } from 'listr2';

import { getPaths, writeFile } from '@redwoodjs/cli-helpers';

import type { SetupInngestFunctionOptions } from './command';

export interface SetupFunctionTasksOptions extends SetupInngestFunctionOptions {}

export const tasks = (options: SetupFunctionTasksOptions) => {
  const SRC_INNGEST_PATH = path.join(getPaths().api.src, 'inngest');

  // eslint-disable-next-line no-console
  console.debug('options', options);

  return new Listr(
    [
      {
        title: 'Create a function ...',
        task: () => {
          // eslint-disable-next-line no-console
          console.debug('Create a delayed function ...');

          const delayedFunctionTemplate = `import { inngest } from 'src/inngest/client'

const ${options.name} = inngest.createFunction(
  { name: '${options.name}' },
  { event: 'test/hello.world' },
  async ({ event, step }) => {
    await step.sleep('1s')

    return {
      event,
      body: '${options.name}',
    }
  }
)

export default ${options.name}
`;

          // eslint-disable-next-line no-console
          console.debug(`Created a ${options.type} function ...`, delayedFunctionTemplate);

          writeFile(path.join(SRC_INNGEST_PATH, `${options.name}.ts`), delayedFunctionTemplate, {
            existingFiles: 'OVERWRITE',
          });
        },
      },
    ],
    { rendererOptions: { collapse: false } }
  );
};
