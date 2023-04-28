import path from 'path';
import execa from 'execa';
import * as jscodeshift from 'jscodeshift/src/Runner';
import { Listr } from 'listr2';
import { getPaths } from '@redwoodjs/cli-helpers';
import { getNamesForFile, renderFunctionTemplate, writeFunctionFile } from './helpers';
import type { SetupFunctionTasksOptions } from './types';

export const tasks = (options: SetupFunctionTasksOptions) => {
  const existingFiles = options.force ? 'OVERWRITE' : 'FAIL';

  return new Listr(
    [
      {
        title: `Create a ${options.type} Inngest function named ${options.name} ...`,
        task: () => {
          const { filename, rendered } = renderFunctionTemplate(options);
          writeFunctionFile(filename, rendered, existingFiles);
        },
      },
      {
        title: `Modify the Inngest handler to register the new ${options.type} Inngest function named ${options.name}...`,
        task: async () => {
          const { functionName } = getNamesForFile(options);

          const SRC_INNGEST_HANDLER_FILE = path.join(getPaths().api.functions, 'inngest.ts');
          const SRC_INNGEST_CODEMOD_FILE = path.join(
            __dirname,
            '..',
            'add-function-to-inngest-handler-codemod.js',
          );

          const defaultJscodeshiftOpts = {
            verbose: 0,
            dry: false,
            print: false,
            babel: false,
            extensions: 'js',
            ignorePattern: '**/node_modules/**',
            ignoreConfig: [],
            runInBand: false,
            silent: true,
            parser: 'ts',
            parserConfig: {},
            failOnError: true,
            stdin: false,
          };

          const functionNames = [functionName];

          if (options.type === 'fan-out') {
            functionNames.push(`${functionName}FanOut`);
          }

          try {
            await jscodeshift.run(SRC_INNGEST_CODEMOD_FILE, [SRC_INNGEST_HANDLER_FILE], {
              ...defaultJscodeshiftOpts,
              functionNames,
            });
          } catch (e: any) {
            // eslint-disable-next-line no-console
            console.error('Failed to modify the GraphQL handler', e.message);
          }
        },
      },
      {
        title: `Lint and Prettify added files ...`,
        task: async () => {
          const SRC_INNGEST_HANDLER_FILE = path.join(getPaths().api.functions, 'inngest.ts');

          execa.commandSync(
            `yarn rw lint --fix ${SRC_INNGEST_HANDLER_FILE}`,
            // eslint-disable-next-line dot-notation
            process.env['RWJS_CWD']
              ? {
                  // eslint-disable-next-line dot-notation
                  cwd: process.env['RWJS_CWD'],
                }
              : {},
          );
        },
      },
    ],
    { rendererOptions: {} },
  );
};
