import type { SetupInngestFunctionOptions } from './command';

export type ExportedType = {
  name: string;
  type: string;
  operationType: 'query' | 'mutation';
};

export interface SetupFunctionTasksOptions extends SetupInngestFunctionOptions {}

export type FunctionImportConfig = { import: string; from: string };
