import type { FileInfo, API, Options, ArrayExpression, ObjectProperty } from 'jscodeshift';

// this is the entry point for a JSCodeshift codemod
export const transform = (file: FileInfo, api: API, options: Options): string | undefined => {
  const j = api.jscodeshift;
  const root = j(file.source);

  // eslint-disable-next-line no-console
  console.log('transform', { file, api, options });

  root
    .find(j.CallExpression, {
      type: 'CallExpression',
      callee: {
        type: 'Identifier',
        name: 'createGraphQLHandler',
      },
    })
    .forEach((callExpressionPath: { node: { arguments: any[] } }) => {
      // eslint-disable-next-line no-console
      console.log('callExpressionPath', callExpressionPath);
      const firstArgument = callExpressionPath.node.arguments[0];

      // eslint-disable-next-line no-console
      console.log('firstArgument', firstArgument);

      if (!firstArgument || firstArgument.type !== 'ObjectExpression') {
        return;
      }

      const onExceptionIndex = firstArgument.properties.findIndex(
        (objectProperty: { type: string; key: { type: string; name: string } }) => {
          if (objectProperty.type !== 'ObjectProperty') {
            return false;
          }

          if (objectProperty.key.type !== 'Identifier') {
            return false;
          }

          return objectProperty.key.name === 'onException';
        }
      );

      let extraPluginsIndex = -1;
      let elements: ArrayExpression['elements'] = [];

      firstArgument.properties.forEach(
        (
          objectProperty: { type: string; key: { type: string; name: string }; value: { type: string; elements: any } },
          i: number
        ) => {
          if (objectProperty.type !== 'ObjectProperty') {
            return false;
          }

          if (objectProperty.key.type !== 'Identifier') {
            return false;
          }

          if (objectProperty.key.name !== 'extraPlugins') {
            return false;
          }

          if (objectProperty.value.type !== 'ArrayExpression') {
            return false;
          }

          extraPluginsIndex = i;
          elements = objectProperty.value.elements;
          return true;
        }
      );

      const extraPluginsOp: ObjectProperty = {
        type: 'ObjectProperty',
        // method: false,
        key: { type: 'Identifier', name: 'extraPlugins' },
        computed: false,
        shorthand: false,
        value: {
          type: 'ArrayExpression',
          elements: [...elements, { type: 'Identifier', name: 'inngestPlugin' }],
        },
      };

      if (extraPluginsIndex !== -1) {
        firstArgument.properties[extraPluginsIndex] = extraPluginsOp;
      } else if (onExceptionIndex !== -1) {
        firstArgument.properties.splice(onExceptionIndex, 0, extraPluginsOp);
      } else {
        // eslint-disable-next-line no-unused-expressions
        ``;
        firstArgument.properties.push(extraPluginsOp);
      }
    });

  // const inngestPluginImportDeclaration = root.find(j.ImportDeclaration, {
  //   source: {
  //     value: '',
  //   },
  // });

  const importDeclarations = root.find(j.ImportDeclaration, ({ source }) => {
    if (source.type !== 'StringLiteral') {
      return false;
    }

    return source.value.endsWith('lib/db') || source.value.endsWith('lib/logger');
  });

  const firstImportDeclaration = importDeclarations.paths()[0];

  if (firstImportDeclaration) {
    firstImportDeclaration.insertBefore({
      type: 'ImportDeclaration',
      importKind: 'value',
      specifiers: [
        {
          type: 'ImportDefaultSpecifier',
          local: { type: 'Identifier', name: 'inngestPlugin' },
        },
      ],
      source: {
        type: 'StringLiteral',
        value: 'src/inngest/plugin',
      },
    });
  }

  return root.toSource();
};
