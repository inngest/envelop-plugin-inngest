const path = require('path');
const fs = require('fs');
const jscodeshift = require('jscodeshift');
const pluginTransform = require('../src/use-inngest-codemod');
const functionTransform = require('../src/add-function-to-inngest-handler-codemod');

describe('codemods', () => {
  const defaultJscodeshiftOpts = {
    verbose: 1,
    dry: false,
    print: true,
    babel: false,
    extensions: ['js', 'json'],
    ignorePattern: '**/node_modules/**',
    ignoreConfig: [],
    runInBand: false,
    silent: false,
    parser: 'ts',
    parserConfig: {},
    failOnError: true,
    stdin: false,
  };

  describe('plugin', () => {
    describe('When using use-inngest-codemod to transform, the graphQL handler', () => {
      describe('transforms code correctly', () => {
        it('when given a standard default GraphQL handler', () => {
          const source = fs.readFileSync(
            path.join(__dirname, '__testfixtures__', 'plugin', 'default.input.js'),
            'utf8'
          );
          const output = pluginTransform(
            { path: '../__testfixtures__/default.input.js', source },
            { jscodeshift },
            { ...defaultJscodeshiftOpts }
          );
          expect(output).toMatchSnapshot();
        });

        it('when given a standard default GraphQL handler with dbAuth setup', () => {
          const source = fs.readFileSync(
            path.join(__dirname, '__testfixtures__', 'plugin', 'default.input.js'),
            'utf8'
          );
          const output = pluginTransform(
            { path: '../__testfixtures__/dbauth.input.js', source },
            { jscodeshift },
            { ...defaultJscodeshiftOpts }
          );
          expect(output).toMatchSnapshot();
        });

        it('when GraphQL handler already configures some extraPlugins', () => {
          const source = fs.readFileSync(
            path.join(__dirname, '__testfixtures__', 'plugin', 'extra-plugins.input.js'),
            'utf8'
          );
          const output = pluginTransform(
            { path: '../__testfixtures__/extra-plugins.input.js', source },
            { jscodeshift },
            { ...defaultJscodeshiftOpts }
          );

          expect(output).toMatchSnapshot();
        });

        it('when GraphQL handler already has useInngest setup', () => {
          const source = fs.readFileSync(path.join(__dirname, '__testfixtures__', 'plugin', 'exists.input.js'), 'utf8');
          const output = pluginTransform(
            { path: '../__testfixtures__/exists.input.js', source },
            { jscodeshift },
            { ...defaultJscodeshiftOpts }
          );
          expect(output).toMatchSnapshot();
        });
      });
    });
  });
  describe('function', () => {
    describe('When using add-function-to-inngest-handler-codemod to transform, the Inngest handler', () => {
      describe('transforms code correctly', () => {
        describe('when given a standard default Inngest handler', () => {
          describe('it adds the new function to the existing array of inngest functions', () => {
            const source = fs.readFileSync(
              path.join(__dirname, '__testfixtures__', 'function', 'default.input.js'),
              'utf8'
            );
            const output = functionTransform(
              { path: '../__testfixtures__/default.input.js', source },
              { jscodeshift },
              { ...defaultJscodeshiftOpts, functionName: 'testFunction' }
            );
            expect(output).toMatchSnapshot();
          });
        });
      });
      describe('when given an Inngest handler with an empty functions array', () => {
        describe('it adds the new function to the empty array of inngest functions', () => {
          const source = fs.readFileSync(
            path.join(__dirname, '__testfixtures__', 'function', 'empty.input.js'),
            'utf8'
          );
          const output = functionTransform(
            { path: '../__testfixtures__/empty.input.js', source },
            { jscodeshift },
            { ...defaultJscodeshiftOpts, functionName: 'addedFunctionToEmpty' }
          );
          expect(output).toMatchSnapshot();
        });
      });
    });
  });
});
