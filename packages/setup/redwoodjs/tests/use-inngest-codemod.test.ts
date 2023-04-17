const path = require('path');
const fs = require('fs');
const jscodeshift = require('jscodeshift');
const transform = require('../src/use-inngest-codemod');

describe('When using use-inngest-codemod to transform, the graphQL handler', () => {
  const defaultJscodeshiftOpts = {
    verbose: 1,
    dry: false,
    print: true,
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

  describe('transforms code correctly', () => {
    it('when given a standard default GraphQL handler', () => {
      const source = fs.readFileSync(path.join(__dirname, '__testfixtures__', 'default.input.js'), 'utf8');
      const output = transform(
        { path: '../__testfixtures__/default.input.js', source },
        { jscodeshift },
        { ...defaultJscodeshiftOpts }
      );
      expect(output).toMatchSnapshot();
    });

    it('when GraphQL handler already configures some extraPlugins', () => {
      const source = fs.readFileSync(path.join(__dirname, '__testfixtures__', 'extra-plugins.input.js'), 'utf8');
      const output = transform(
        { path: '../__testfixtures__/extra-plugins.input.js', source },
        { jscodeshift },
        { ...defaultJscodeshiftOpts }
      );

      expect(output).toMatchSnapshot();
    });

    it('when GraphQL handler already has useInngest setup', () => {
      const source = fs.readFileSync(path.join(__dirname, '__testfixtures__', 'exists.input.js'), 'utf8');
      const output = transform(
        { path: '../__testfixtures__/exists.input.js', source },
        { jscodeshift },
        { ...defaultJscodeshiftOpts }
      );
      expect(output).toMatchSnapshot();
    });
  });
});
