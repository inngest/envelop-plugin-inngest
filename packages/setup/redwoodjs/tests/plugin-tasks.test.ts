import path from 'path';
import { addScriptToPackageJsonTask, tasks } from '../src/plugin/tasks';

let f = '';

jest.mock('@redwoodjs/cli-helpers', () => {
  const path = require('path');
  const __dirname = path.resolve();

  return {
    getPaths: () => ({
      api: {
        src: path.join('__testfixtures__', 'plugin', 'create-redwood-app/template/api/src'),
        functions: path.join(
          '__testfixtures__',
          'plugin',
          'create-redwood-app/template/api/src/functions',
        ),
        lib: path.join('__testfixtures__', 'plugin', 'create-redwood-app/template/api/src/lib'),
      },
      web: { src: '' },
      base: path.join('__testfixtures__', 'plugin', 'create-redwood-app/template'),
    }),
    writeFile: (target: string, contents: string) => {
      f = contents;
    },
  };
});

// jest.mock('../../lib/project', () => ({
//   isTypeScriptProject: () => true,
// }));

describe('Plugin tasks', () => {
  it('has tasks', () => {
    expect(tasks).toBeDefined();
  });

  it('has addScriptToPackageJsonTask', () => {
    expect(addScriptToPackageJsonTask).toBeDefined();
    const commandPaths = {
      PACKAGE_JSON_PATH: path.join(__dirname, '__testfixtures__', 'plugin', 'test.package.json'),
    };

    //  packages/setup/redwoodjs/tests/__testfixtures__/plugin/package.json
    addScriptToPackageJsonTask({ commandPaths });

    expect(f).toMatchSnapshot();
  });
});
