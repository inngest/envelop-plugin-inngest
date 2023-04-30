import path from 'path';
import execa from 'execa';
import fs from 'fs-extra';
import * as jscodeshift from 'jscodeshift/src/Runner';
import { Listr } from 'listr2';
import { getPaths, writeFile } from '@redwoodjs/cli-helpers';
import type { ForceOptions } from './command';

export interface SetupPluginTasksOptions extends ForceOptions {}

interface PackageJson {
  scripts?: Record<string, string>;
}

export const tasks = (options: SetupPluginTasksOptions) => {
  const PACKAGE_JSON_PATH = path.join(getPaths().base, 'package.json');
  const SRC_INNGEST_PATH = path.join(getPaths().api.src, 'jobs', 'inngest');
  const SRC_LIB_PATH = path.join(getPaths().api.lib);
  const SRC_PLUGINS_PATH = path.join(getPaths().api.src, 'plugins');
  const SRC_GRAPHQL_FUNCTION_FILE = path.join(getPaths().api.functions, 'graphql.ts');
  const SRC_INNGEST_CODEMOD_FILE = path.join(__dirname, '..', 'use-inngest-codemod.js');

  const commandPaths = {
    PACKAGE_JSON_PATH,
    SRC_GRAPHQL_FUNCTION_FILE,
    SRC_INNGEST_CODEMOD_FILE,
    SRC_INNGEST_PATH,
    SRC_LIB_PATH,
    SRC_PLUGINS_PATH,
  };
  const existingFiles = options.force ? 'OVERWRITE' : 'FAIL';

  return new Listr(
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
              : {},
          );
        },
      },

      {
        title: 'Configure inngest ...',
        task: () => {
          configureInngestTask({ commandPaths, existingFiles });
        },
      },
      {
        title: 'Add the Inngest GraphQL plugin ...',
        task: () => {
          addInngestGraphQLPluginTask({ commandPaths, existingFiles });
        },
      },
      {
        title: 'Add inngest helloWorld example ...',
        task: () => {
          addInngestHelloWorldExampleTask({ commandPaths, existingFiles });
        },
      },
      {
        title: 'Modify the GraphQL handler to the useInngest plugin ...',
        task: async () => {
          modifyGraphQLHandlerTask({ commandPaths });
        },
      },
      {
        title: 'Add inngest dev script to package.json',
        task: async () => {
          addScriptToPackageJsonTask({ commandPaths });
        },
      },
      {
        title: `Lint and Prettify added files ...`,
        task: async () => {
          const SRC_GRAPHQL_FUNCTION_FILE = path.join(getPaths().api.functions, 'graphql.ts');

          execa.commandSync(
            `yarn rw lint --fix ${SRC_GRAPHQL_FUNCTION_FILE}`,
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

export const addScriptToPackageJsonTask = ({
  commandPaths,
}: {
  commandPaths: Record<string, string>;
}) => {
  const packageJson = JSON.parse(
    fs.readFileSync(commandPaths.PACKAGE_JSON_PATH, 'utf-8'),
  ) as PackageJson;

  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }

  packageJson.scripts['inngest:dev'] =
    'npx inngest-cli@latest dev -u http://localhost:8911/inngest';

  writeFile(commandPaths.PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2), {
    existingFiles: 'OVERWRITE',
  });
};

export const configureInngestTask = ({
  commandPaths,
  existingFiles,
}: {
  commandPaths: Record<string, string>;
  existingFiles: 'OVERWRITE' | 'FAIL';
}) => {
  // save inngest handler function in api functions
  const inngestServerFunctionTemplate = fs.readFileSync(
    path.resolve(__dirname, '..', '..', 'templates', 'plugin', 'inngest.ts.template'),
    'utf-8',
  );

  writeFile(path.join(getPaths().api.functions, 'inngest.ts'), inngestServerFunctionTemplate, {
    existingFiles,
  });

  // save inngest client to a api lib
  fs.ensureDirSync(commandPaths.SRC_LIB_PATH);

  const inngestClientTemplate = fs.readFileSync(
    path.resolve(__dirname, '..', '..', 'templates', 'plugin', 'client.ts.template'),
    'utf-8',
  );

  writeFile(path.join(commandPaths.SRC_LIB_PATH, 'inngest.ts'), inngestClientTemplate, {
    existingFiles: 'OVERWRITE',
  });
};

const addInngestGraphQLPluginTask = ({
  commandPaths,
  existingFiles,
}: {
  commandPaths: Record<string, string>;
  existingFiles: 'OVERWRITE' | 'FAIL';
}) => {
  // save inngest plugin to a new plugins folder
  fs.ensureDirSync(commandPaths.SRC_PLUGINS_PATH);

  const inngestPluginTemplate = fs.readFileSync(
    path.resolve(__dirname, '..', '..', 'templates', 'plugin', 'plugin.ts.template'),
    'utf-8',
  );

  writeFile(path.join(commandPaths.SRC_PLUGINS_PATH, 'useInngest.ts'), inngestPluginTemplate, {
    existingFiles,
  });
};

const addInngestHelloWorldExampleTask = ({
  commandPaths,
  existingFiles,
}: {
  commandPaths: Record<string, string>;
  existingFiles: 'OVERWRITE' | 'FAIL';
}) => {
  // save example inngest functions in the inngest folder
  fs.ensureDirSync(commandPaths.SRC_INNGEST_PATH);

  const inngestHelloWorldTemplate = fs.readFileSync(
    path.resolve(__dirname, '..', '..', 'templates', 'plugin', 'helloWorld.ts.template'),
    'utf-8',
  );

  return writeFile(
    path.join(commandPaths.SRC_INNGEST_PATH, 'helloWorld.ts'),
    inngestHelloWorldTemplate,
    {
      existingFiles,
    },
  );
};

export const modifyGraphQLHandlerTask = async ({
  commandPaths,
}: {
  commandPaths: Record<string, string>;
}) => {
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

  try {
    await jscodeshift.run(
      commandPaths.SRC_INNGEST_CODEMOD_FILE,
      [commandPaths.SRC_GRAPHQL_FUNCTION_FILE],
      {
        ...defaultJscodeshiftOpts,
      },
    );
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error('Failed to modify the GraphQL handler', e.message);
  }
};
