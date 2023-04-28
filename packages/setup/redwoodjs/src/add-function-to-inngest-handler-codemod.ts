import { API, FileInfo, ImportDeclaration } from 'jscodeshift';

module.exports = function (
  file: FileInfo,
  api: API,
  { functionNames }: { functionNames: string[] },
) {
  const j = api.jscodeshift;

  const root = j(file.source);

  functionNames.forEach(functionName => {
    // Add the new import statement
    const newImport: ImportDeclaration = j.importDeclaration(
      [j.importDefaultSpecifier(j.identifier(functionName))],
      j.literal(`src/jobs/inngest/${functionName}`),
    );
    const existingImports = root.find(j.ImportDeclaration);
    existingImports.at(1).insertAfter(newImport);

    // Add the new identifier to the inngestFunctions array
    const inngestFunctions = root.find(j.VariableDeclaration, {
      declarations: [{ id: { name: 'inngestFunctions' } }],
    });
    const newFunction = j.identifier(functionName);
    inngestFunctions.find(j.ArrayExpression).get('elements').push(newFunction);
  });

  return root.toSource();
};
