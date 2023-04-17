import fs from 'fs-extra';
import path from 'path';

// import chalk from 'chalk'
import execa from 'execa';
import { Listr } from 'listr2';

import { colors, getPaths, writeFile } from '@redwoodjs/cli-helpers';

import * as jscodeshift from 'jscodeshift/src/Runner';

interface ErrorWithExitCode extends Error {
  exitCode?: number;
}

function isErrorWithExitCode(e: unknown): e is ErrorWithExitCode {
  return typeof (e as ErrorWithExitCode)?.exitCode !== 'undefined';
}

// NOTE: Since inngest excels in TS, doesn't make sense to support JS
// but then should have a check to see if RedwoodJS project is not TS and suggest to convert to TS
export const handler = async ({ force }: { force: boolean }) => {
  const SRC_INNGEST_PATH = path.join(getPaths().api.src, 'inngest');

  const tasks = new Listr(
    [
      {
        title: 'Install inngest packages ...',
        task: () => {
          execa.commandSync(
            'yarn workspace api add envelop-plugin-inngest',
            // eslint-disable-next-line dot-notation
            process.env['RWJS_CWD']
              ? {
                  // eslint-disable-next-line dot-notation
                  cwd: process.env['RWJS_CWD'],
                }
              : {}
          );
        },
      },

      {
        title: 'Configure inngest ...',
        task: () => {
          const inngestServerFunctionTemplate = fs.readFileSync(
            path.resolve(__dirname, '..', 'templates', 'inngest.ts.template'),
            'utf-8'
          );

          writeFile(path.join(getPaths().api.functions, 'inngest.ts'), inngestServerFunctionTemplate, {
            existingFiles: 'OVERWRITE',
          });

          fs.ensureDirSync(SRC_INNGEST_PATH);

          const inngestClientTemplate = fs.readFileSync(
            path.resolve(__dirname, '..', 'templates', 'client.ts.template'),
            'utf-8'
          );

          writeFile(path.join(SRC_INNGEST_PATH, 'client.ts'), inngestClientTemplate, { existingFiles: 'OVERWRITE' });
        },
      },
      {
        title: 'Add the Inngest GraphQL plugin ...',
        task: () => {
          const inngestPluginTemplate = fs.readFileSync(
            path.resolve(__dirname, '..', 'templates', 'plugin.ts.template'),
            'utf-8'
          );

          writeFile(path.join(SRC_INNGEST_PATH, 'plugin.ts'), inngestPluginTemplate, { existingFiles: 'OVERWRITE' });
        },
      },
      {
        title: 'Add inngest helloWorld example ...',
        task: () => {
          const inngestHelloWorldTemplate = fs.readFileSync(
            path.resolve(__dirname, '..', 'templates', 'helloWorld.ts.template'),
            'utf-8'
          );

          return writeFile(path.join(SRC_INNGEST_PATH, 'helloWorld.ts'), inngestHelloWorldTemplate, {
            existingFiles: 'OVERWRITE',
          });
        },
      },
      {
        title: 'Modify the GraphQL handler to the useInngest plugin ...',
        task: async () => {
          const SRC_GRAPHQL_FUNCTION_FILE = path.join(getPaths().api.functions, 'graphql.ts');
          const SRC_INNGEST_CODEMOD_FILE = path.join(__dirname, 'use-inngest-codemod.js');

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
            await jscodeshift.run(SRC_INNGEST_CODEMOD_FILE, [SRC_GRAPHQL_FUNCTION_FILE], {
              ...defaultJscodeshiftOpts,
            });
          } catch (e: any) {
            // eslint-disable-next-line no-console
            console.error('Failed to modify the GraphQL handler', e.message);
          }
        },
      },
    ],
    { rendererOptions: { collapse: false } }
  );

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
