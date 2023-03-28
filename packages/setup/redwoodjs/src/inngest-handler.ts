import fs from 'fs-extra';
import path from 'path';

// import chalk from 'chalk'
import execa from 'execa';
import { Listr } from 'listr2';

import { colors, getPaths, writeFile } from '@redwoodjs/cli-helpers';

interface ErrorWithExitCode extends Error {
  exitCode?: number;
}

function isErrorWithExitCode(e: unknown): e is ErrorWithExitCode {
  return typeof (e as ErrorWithExitCode)?.exitCode !== 'undefined';
}
// NOTE: Since inngest excels in TS, doesn't make sense to support JS
// but then should have a check to see if RedwoodJS project is not TS and suggest to convert to TS
export const handler = async ({ force }: { force: boolean }) => {
  const tasks = new Listr(
    [
      {
        title: 'Installing packages...',
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
        title: 'Configure Inngest...',
        task: () => {
          const inngestServerFunctionTemplate = fs.readFileSync(
            path.resolve(__dirname, '..', 'templates', 'inngest.ts.template'),
            'utf-8'
          );

          writeFile(path.join(getPaths().api.functions, 'inngest.ts'), inngestServerFunctionTemplate, {
            existingFiles: 'OVERWRITE',
          });

          const SRC_INNGEST_PATH = path.join(getPaths().api.src, 'inngest');

          fs.ensureDirSync(SRC_INNGEST_PATH);

          const inngestClientTemplate = fs.readFileSync(
            path.resolve(__dirname, '..', 'templates', 'client.ts.template'),
            'utf-8'
          );

          writeFile(path.join(SRC_INNGEST_PATH, 'client.ts'), inngestClientTemplate, { existingFiles: 'OVERWRITE' });

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
