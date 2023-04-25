import path from 'path';
import camelcase from 'camelcase';
import fs from 'fs-extra';
import humanize from 'humanize-string';
import template from 'lodash.template';
import { paramCase } from 'param-case';
import { getPaths, writeFile } from '@redwoodjs/cli-helpers';
import type { ExistingFiles } from '@redwoodjs/cli-helpers';
import type { ExportedType, SetupFunctionTasksOptions } from './types';

export const getWebGraphQLTypeDefsFile = () => {
  const GRAPHQL_TYPES_PATH = path.join(getPaths().web.types, 'graphql.d.ts');
  return fs.readFileSync(GRAPHQL_TYPES_PATH, 'utf-8');
};

export const getExportedQueryAndMutationTypes = (graphQLTypeDefs?: string): ExportedType[] => {
  const fileContents = graphQLTypeDefs || getWebGraphQLTypeDefsFile();

  const exportedTypes: ExportedType[] = [];

  // Extract exported types
  const typeRegex =
    /export\s+type\s+(\w+)\s+=\s+{[^}]*__typename\?:\s+['"](?:Query|Mutation)['"][^}]*}/g;

  let match;
  while ((match = typeRegex.exec(fileContents)) !== null) {
    if (!['Mutation', 'Query'].includes(match[1])) {
      const name = match[1];
      const type = match[0];
      const operationType = type.includes("__typename?: 'Query'") ? 'query' : 'mutation';
      exportedTypes.push({ name, type, operationType });
    }
  }

  // Filter exported types with __typename of Query or Mutation
  const filteredTypes = exportedTypes.filter(type => type.operationType === 'query' || 'mutation');

  return filteredTypes.sort((a, b) => {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  });
};

export const getNamesForFile = (options: SetupFunctionTasksOptions) => {
  const name = options.name;
  const functionName = camelcase(name);
  const humanizedName = humanize(name);
  const eventFromName = paramCase(name);

  let eventPrefix = 'event';
  let eventName = `${eventPrefix}/${eventFromName}`;

  if (options.graphql && options.type !== 'scheduled' && options.eventName) {
    eventPrefix = 'graphql';
    eventName = `${eventPrefix}/${paramCase(options.eventName)}.${options.operationType}`;
  }

  return { functionName, humanizedName, eventName };
};

export const renderFunctionTemplate = (options: SetupFunctionTasksOptions) => {
  const { eventName, functionName, humanizedName } = getNamesForFile(options);

  const compiled = template(
    fs
      .readFileSync(
        path.resolve(__dirname, '..', '..', 'templates', 'function', `${options.type}.ts.template`),
        'utf-8',
      )
      .toString(),
  );

  const rendered = compiled({ name: options.name, eventName, functionName, humanizedName });

  return { filename: functionName, rendered };
};

export const writeFunctionFile = (
  filename: string,
  rendered: string,
  existingFiles: ExistingFiles,
) => {
  const SRC_INNGEST_PATH = path.join(getPaths().api.src, 'jobs', 'inngest');

  writeFile(path.join(SRC_INNGEST_PATH, `${filename}.ts`), rendered, {
    existingFiles,
  });
};
