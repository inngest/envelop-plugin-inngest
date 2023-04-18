// import fs from 'fs-extra';
import path from 'path';

import camelcase from 'camelcase';
import { paramCase } from 'param-case';
import humanize from 'humanize-string';

import { Listr } from 'listr2';

import { getPaths, writeFile } from '@redwoodjs/cli-helpers';

import type { SetupInngestFunctionOptions } from './command';

export interface SetupFunctionTasksOptions extends SetupInngestFunctionOptions {}

const getNamesForFile = (name: string) => {
  const functionName = camelcase(name);
  const humanizedName = humanize(name);
  const eventName = paramCase(name).replace(/-/g, '.');

  return { functionName, humanizedName, eventName };
};

const SRC_INNGEST_PATH = path.join(getPaths().api.src, 'inngest');

const getBackgroundFunctionTemplate = (name: string) => {
  const { functionName, eventName } = getNamesForFile(name);

  const template = `import { inngest } from 'src/inngest/client'

const ${functionName} = inngest.createFunction(
  { name: '${name}' },
  { event: 'event/${eventName}' },
  
  // This function will be called every time an event payload is received
  async ({ event, step }) => {
    // You can write whatever you want here.
    return
  }
)

export default ${functionName}
  `;

  return { filename: functionName, template };
};

const getDelayedFunctionTemplate = (name: string) => {
  const { functionName, humanizedName, eventName } = getNamesForFile(name);

  const template = `import { inngest } from 'src/inngest/client'

const ${functionName} = inngest.createFunction(
  { name: '${name}' },
  { event: 'event/${eventName}' },
  async ({ event, step }) => {
    await step.sleep('1s')

    return {
      event,
      body: '${humanizedName}',
    }
  }
)

export default ${functionName}
  `;

  return { filename: functionName, template };
};

const getScheduledFunctionTemplate = (name: string) => {
  const { functionName, humanizedName } = getNamesForFile(name);

  const template = `import { inngest } from 'src/inngest/client'

const ${functionName} = inngest.createFunction(
  { name: '${humanizedName}' }, // The name of your function, used for observability.
  { cron: 'TZ=America/New_York 0 9 * * MON' }, // The cron syntax for the function. TZ= is optional.

  // This function will be called on the schedule above
  async ({ step }) => {
    // You can write whatever you want here.
    return
  }
)

export default ${functionName}
`;

  return { filename: functionName, template };
};

const getStepFunctionTemplate = (name: string) => {
  const { functionName, humanizedName, eventName } = getNamesForFile(name);

  const template = `import { inngest } from 'src/inngest/client'

const ${functionName} = inngest.createFunction(
  { name: '${humanizedName}' },
  { event: 'app/${eventName}' },
  async ({ event, step }) => {
    // Send the user a welcome email
    await step.run('Send welcome email', () =>
      sendEmail({ email: event.data.email, template: 'welcome' })
    );

    // Wait for the user to create an order, by waiting and
    // matching on another event
    const order = await step.waitForEvent('app/order.created', {
      match: 'data.user.id',
      timeout: '24h',
    });

    if (!order) {
      // User didn't create an order within 24 hours; send
      // them an activation email
      await step.run('Send activation email', async () => {
        // Some code here
      });
    }
  }
)

export default ${functionName}
  `;

  return { filename: functionName, template };
};

const writeFunctionFile = (filename: string, template: string) => {
  writeFile(path.join(SRC_INNGEST_PATH, `${filename}.ts`), template, {
    existingFiles: 'OVERWRITE',
  });
};

export const tasks = (options: SetupFunctionTasksOptions) => {
  // eslint-disable-next-line no-console
  console.debug('options', options);

  return new Listr(
    [
      {
        title: `Create a ${options.type} Inngest function named ${options.name} ...`,
        task: () => {
          // eslint-disable-next-line no-console

          switch (options.type) {
            case 'background': {
              const { filename, template } = getBackgroundFunctionTemplate(options.name);
              writeFunctionFile(filename, template);
              break;
            }
            case 'delayed': {
              const { filename, template } = getDelayedFunctionTemplate(options.name);
              writeFunctionFile(filename, template);
              break;
            }
            case 'scheduled': {
              const { filename, template } = getScheduledFunctionTemplate(options.name);
              writeFunctionFile(filename, template);
              break;
            }
            case 'step': {
              const { filename, template } = getStepFunctionTemplate(options.name);
              writeFunctionFile(filename, template);
              break;
            }
          }
        },
      },
    ],
    { rendererOptions: { collapse: false } }
  );
};
