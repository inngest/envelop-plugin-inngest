import path from 'path';
import {
  addInngestGraphQLPluginTask,
  addInngestHelloWorldExampleTask,
  addScriptToPackageJsonTask,
  configureInngestTask,
  modifyGraphQLHandlerTask,
  tasks,
} from '../src/plugin/tasks';

let outputFileContents = '';

beforeEach(() => {
  outputFileContents = '';
});

afterEach(() => {
  outputFileContents = '';
});

afterAll(() => {
  jest.clearAllMocks();
});

jest.mock('@redwoodjs/cli-helpers', () => {
  const path = require('path');
  const __dirname = path.resolve();

  return {
    getPaths: () => ({
      api: {
        src: path.join('__testfixtures__', 'plugin', 'test-project/api/src'),
        functions: path.join('__testfixtures__', 'plugin', 'test-project/api/src/functions'),
        lib: path.join('__testfixtures__', 'plugin', 'test-project/api/src/lib'),
      },
      web: { src: '' },
      base: path.join('__testfixtures__', 'plugin', 'test-project'),
    }),
    writeFile: (target: string, contents: string) => {
      outputFileContents = contents;
    },
  };
});

describe('Plugin tasks', () => {
  const commandPaths = {
    PACKAGE_JSON_PATH: path.join(__dirname, '__testfixtures__', 'plugin', 'test.package.json'),
    SRC_LIB_PATH: path.join(__dirname, '__testfixtures__', 'plugin'),
    SRC_INNGEST_PATH: path.join(__dirname, '__testfixtures__', 'plugin'),
    SRC_PLUGINS_PATH: path.join(__dirname, '__testfixtures__', 'plugin'),
    SRC_GRAPHQL_FUNCTION_FILE: path.join(
      __dirname,
      '__testfixtures__',
      'plugin',
      'test-project',
      'api',
      'src',
      'functions',
      'graphql.js',
    ),
    SRC_INNGEST_CODEMOD_FILE: path.join(
      __dirname,
      '..',
      '..',
      'redwoodjs',
      'dist',
      'cjs',
      'use-inngest-codemod.js',
    ),
  };

  it('has tasks', () => {
    expect(tasks).toBeDefined();
    expect(
      tasks({ force: false, cwd: path.join(__dirname, '__testfixtures__', 'plugin') }).tasks.length,
    ).toBe(7);
  });

  it('has addScriptToPackageJsonTask', () => {
    expect(addScriptToPackageJsonTask).toBeDefined();

    addScriptToPackageJsonTask({ commandPaths });

    expect(outputFileContents).toMatchSnapshot();
  });

  it('has configureInngestTask', () => {
    expect(configureInngestTask).toBeDefined();

    configureInngestTask({ commandPaths, existingFiles: 'FAIL' });

    expect(outputFileContents).toMatchSnapshot();
  });

  it('has addInngestGraphQLPluginTask', () => {
    expect(addInngestGraphQLPluginTask).toBeDefined();

    addInngestGraphQLPluginTask({ commandPaths, existingFiles: 'FAIL' });

    expect(outputFileContents).toMatchSnapshot();
  });

  it('has addInngestHelloWorldExampleTask', () => {
    expect(addInngestHelloWorldExampleTask).toBeDefined();

    addInngestHelloWorldExampleTask({ commandPaths, existingFiles: 'FAIL' });

    expect(outputFileContents).toMatchSnapshot();
  });
  it('has modifyGraphQLHandlerTask', () => {
    expect(modifyGraphQLHandlerTask).toBeDefined();

    modifyGraphQLHandlerTask({ commandPaths, dry: 1 });
  });
});
