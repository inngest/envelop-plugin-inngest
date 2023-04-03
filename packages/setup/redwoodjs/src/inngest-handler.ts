import fs from 'fs-extra';
import path from 'path';

// import chalk from 'chalk'
import execa from 'execa';
import { Listr } from 'listr2';

import { colors, getPaths, writeFile } from '@redwoodjs/cli-helpers';
import { getRWPaths } from './lib/get-rw-paths';
import { runTransform } from './lib/run-transform';
import { isTSProject } from './lib/is-ts-project';
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
        title: 'Installing inngest packages ...',
        task: () => {
          return new Listr(
            [
              {
                title: 'Install inngest',
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
            ],
            { rendererOptions: { collapse: false } }
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
        title: 'Configure inngest GraphQL plugin ...',
        task: async () => {
          const graphqlHandlerFile = isTSProject ? 'graphql.ts' : 'graphql.js';

          const transformPath = path.join(__dirname, 'modify-graphql-handler.ts');
          const targetPaths = [path.join(getRWPaths().api.base, 'src', 'functions', graphqlHandlerFile)];

          // eslint-disable-next-line no-console
          console.log('graphqlHandlerFile', graphqlHandlerFile, transformPath, targetPaths);

          const result = await runTransform({
            transformPath,
            targetPaths,
          });

          // eslint-disable-next-line no-console
          console.log('result', result);
        },
      },
      {
        title: 'Modify GraphQLHandler to use plugin ...',
        task: () => {
          const inngestPluginTemplate = fs.readFileSync(
            path.resolve(__dirname, '..', 'templates', 'plugin.ts.template'),
            'utf-8'
          );

          writeFile(path.join(SRC_INNGEST_PATH, 'plugin.ts'), inngestPluginTemplate, { existingFiles: 'OVERWRITE' });
        },
      },
      {
        title: 'Adding inngest helloWorld example ...',
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
