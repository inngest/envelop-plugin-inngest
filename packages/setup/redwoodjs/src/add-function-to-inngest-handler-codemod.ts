import { API, FileInfo, ImportDeclaration } from 'jscodeshift';
import type { FunctionImportConfig } from './function/types';

module.exports = function (
  file: FileInfo,
  api: API,
  { functionImportConfig }: { functionImportConfig: FunctionImportConfig[] },
) {
  const j = api.jscodeshift;

  const root = j(file.source);

  functionImportConfig.forEach(config => {
    // Add the new import statement
    const newImport: ImportDeclaration = j.importDeclaration(
      [j.importDefaultSpecifier(j.identifier(`{ ${config.import} }`))],
      j.literal(`src/jobs/inngest/${config.from}`),
    );
    const existingImports = root.find(j.ImportDeclaration);
    existingImports.at(1).insertAfter(newImport);

    // Add the new identifier to the inngestFunctions array
    const inngestFunctions = root.find(j.VariableDeclaration, {
      declarations: [{ id: { name: 'inngestFunctions' } }],
    });
    const newFunction = j.identifier(config.import);
    inngestFunctions.find(j.ArrayExpression).get('elements').push(newFunction);
  });

  return root.toSource();
};
