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

const addScriptToPackageJson = () => {
  const packageJsonPath = './package.json';
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8')) as PackageJson;

  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }

  packageJson.scripts['inngest:dev'] =
    'npx inngest-cli@latest dev -u http://localhost:8911/inngest';

  writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), { existingFiles: 'OVERWRITE' });
};

export const tasks = (options: SetupPluginTasksOptions) => {
  const SRC_INNGEST_PATH = path.join(getPaths().api.src, 'inngest');
  const SRC_LIB_PATH = path.join(getPaths().api.lib);
  const SRC_PLUGINS_PATH = path.join(getPaths().api.src, 'plugins');

  const existingFiles = options.force ? 'OVERWRITE' : 'FAIL';

  return new Listr(
    [
      {
        title: 'Install inngest packages ...',
        task: () => {
          execa.execaCommandSync(
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
          // save inngest handler function in api functions
          const inngestServerFunctionTemplate = fs.readFileSync(
            path.resolve(__dirname, '..', '..', 'templates', 'plugin', 'inngest.ts.template'),
            'utf-8',
          );

          writeFile(
            path.join(getPaths().api.functions, 'inngest.ts'),
            inngestServerFunctionTemplate,
            {
              existingFiles,
            },
          );

          // save inngest client to a api lib
          fs.ensureDirSync(SRC_LIB_PATH);

          const inngestClientTemplate = fs.readFileSync(
            path.resolve(__dirname, '..', '..', 'templates', 'plugin', 'client.ts.template'),
            'utf-8',
          );

          writeFile(path.join(SRC_LIB_PATH, 'inngest.ts'), inngestClientTemplate, {
            existingFiles: 'OVERWRITE',
          });
        },
      },
      {
        title: 'Add the Inngest GraphQL plugin ...',
        task: () => {
          // save inngest plugin to a new plugins folder
          fs.ensureDirSync(SRC_PLUGINS_PATH);

          const inngestPluginTemplate = fs.readFileSync(
            path.resolve(__dirname, '..', '..', 'templates', 'plugin', 'plugin.ts.template'),
            'utf-8',
          );

          writeFile(path.join(SRC_PLUGINS_PATH, 'useInngest.ts'), inngestPluginTemplate, {
            existingFiles,
          });
        },
      },
      {
        title: 'Add inngest helloWorld example ...',
        task: () => {
          // save example inngest functions in the inngest folder
          fs.ensureDirSync(SRC_INNGEST_PATH);

          const inngestHelloWorldTemplate = fs.readFileSync(
            path.resolve(__dirname, '..', '..', 'templates', 'plugin', 'helloWorld.ts.template'),
            'utf-8',
          );

          return writeFile(
            path.join(SRC_INNGEST_PATH, 'helloWorld.ts'),
            inngestHelloWorldTemplate,
            {
              existingFiles,
            },
          );
        },
      },
      {
        title: 'Modify the GraphQL handler to the useInngest plugin ...',
        task: async () => {
          const SRC_GRAPHQL_FUNCTION_FILE = path.join(getPaths().api.functions, 'graphql.ts');
          const SRC_INNGEST_CODEMOD_FILE = path.join(__dirname, '..', 'use-inngest-codemod.js');

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
      {
        title: 'Add inngest dev script to package.json',
        task: async () => {
          addScriptToPackageJson();
        },
      },
      {
        title: `Lint and Prettify added files ...`,
        task: async () => {
          const SRC_GRAPHQL_FUNCTION_FILE = path.join(getPaths().api.functions, 'graphql.ts');

          execa.execaCommandSync(
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
