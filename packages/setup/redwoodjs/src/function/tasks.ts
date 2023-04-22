import path from 'path';
import camelcase from 'camelcase';
import execa from 'execa';
import fs from 'fs-extra';
import humanize from 'humanize-string';
import * as jscodeshift from 'jscodeshift/src/Runner';
import { Listr } from 'listr2';
import template from 'lodash.template';
import { paramCase } from 'param-case';
import { getPaths, writeFile } from '@redwoodjs/cli-helpers';
import type { ExistingFiles } from '@redwoodjs/cli-helpers';
import type { SetupInngestFunctionOptions } from './command';

export interface SetupFunctionTasksOptions extends SetupInngestFunctionOptions {}

const getNamesForFile = (name: string) => {
  const functionName = camelcase(name);
  const humanizedName = humanize(name);
  const eventName = paramCase(name).replace(/-/g, '.');

  return { functionName, humanizedName, eventName };
};

const SRC_INNGEST_PATH = path.join(getPaths().api.src, 'inngest');

const renderFunctionTemplate = (name: string, type: string) => {
  const { eventName, functionName, humanizedName } = getNamesForFile(name);

  const compiled = template(
    fs
      .readFileSync(
        path.resolve(__dirname, '..', '..', 'templates', 'function', `${type}.ts.template`),
        'utf-8',
      )
      .toString(),
  );

  const rendered = compiled({ name, eventName, functionName, humanizedName });

  return { filename: functionName, rendered };
};

const writeFunctionFile = (filename: string, rendered: string, existingFiles: ExistingFiles) => {
  writeFile(path.join(SRC_INNGEST_PATH, `${filename}.ts`), rendered, {
    existingFiles,
  });
};

export const tasks = (options: SetupFunctionTasksOptions) => {
  const existingFiles = options.force ? 'OVERWRITE' : 'FAIL';

  return new Listr(
    [
      {
        title: `Create a ${options.type} Inngest function named ${options.name} ...`,
        task: () => {
          const { filename, rendered } = renderFunctionTemplate(options.name, options.type);
          writeFunctionFile(filename, rendered, existingFiles);
        },
      },
      {
        title: `Modify the Inngest handler to register the new ${options.type} Inngest function function  named ${options.name}...`,
        task: async () => {
          const { functionName } = getNamesForFile(options.name);

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
            silent: false,
            parser: 'ts',
            parserConfig: {},
            failOnError: true,
            stdin: false,
          };

          try {
            await jscodeshift.run(SRC_INNGEST_CODEMOD_FILE, [SRC_INNGEST_HANDLER_FILE], {
              ...defaultJscodeshiftOpts,
              functionName,
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
