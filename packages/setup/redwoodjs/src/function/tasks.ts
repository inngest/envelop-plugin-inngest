import fs from 'fs';
import path from 'path';
import execa from 'execa';
import * as jscodeshift from 'jscodeshift/src/Runner';
import { Listr } from 'listr2';
import { getPaths, writeFile } from '@redwoodjs/cli-helpers';
import { getConfigPath } from '@redwoodjs/project-config';
import { getNamesForFile, renderFunctionTemplate, writeFunctionFile } from './helpers';
import type { SetupFunctionTasksOptions } from './types';

export const tasks = (options: SetupFunctionTasksOptions) => {
  const existingFiles = options.force ? 'OVERWRITE' : 'FAIL';

  return new Listr(
    [
      {
        title: 'Adding config to redwood.toml...',
        task: () => {
          const redwoodTomlPath = getConfigPath();
          const configContent = fs.readFileSync(redwoodTomlPath, 'utf-8');
          const tomlKey = `[experimental.jobs.inngest.function.${options.type}]`;
          if (!configContent.includes(tomlKey)) {
            // Use string replace to preserve comments and formatting
            writeFile(redwoodTomlPath, configContent.concat(`\n${tomlKey}`), {
              existingFiles: 'OVERWRITE', // redwood.toml always exists
            });
          }
        },
      },
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

          const functionImportConfig = [{ import: functionName, from: functionName }];

          if (options.type === 'fan-out') {
            functionImportConfig.push({ import: `${functionName}FanOut`, from: functionName });
          }

          try {
            await jscodeshift.run(SRC_INNGEST_CODEMOD_FILE, [SRC_INNGEST_HANDLER_FILE], {
              ...defaultJscodeshiftOpts,
              functionImportConfig,
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
