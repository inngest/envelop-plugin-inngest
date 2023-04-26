import fs from 'fs';
import path from 'path';
import { getExportedQueryAndMutationTypes } from '../src/function/helpers';

describe('Extracts queries and mutations from graphql type defs', () => {
  describe('When type defs have queries and mutations', () => {
    const source = fs.readFileSync(
      path.join(__dirname, '__testfixtures__', 'function', 'graphql.d.ts'),
      'utf8',
    );
    const typeDefNames = getExportedQueryAndMutationTypes(source).map(t => t.name);
    const typeDefOperationTypes = getExportedQueryAndMutationTypes(source).map(
      t => t.operationType,
    );
    it('should return the names of the queries and mutations sorted', () => {
      expect(typeDefNames).toMatchSnapshot();
    });

    it('should return the if a query or mutation', () => {
      expect(typeDefOperationTypes).toMatchSnapshot();
    });
  });
});
