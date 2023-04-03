import fg from 'fast-glob';

import { getRWPaths } from './get-rw-paths';

export const isTSProject =
  fg.sync(`${getRWPaths().base}/**/tsconfig.json`, {
    ignore: ['**/node_modules/**'],
  }).length > 0;
