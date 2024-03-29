import fs from 'fs';
import path from 'path';
import findup from 'findup-sync';
import yargs from 'yargs';
import Parser from 'yargs-parser';
import { hideBin } from 'yargs/helpers';
import { isTypeScriptProject } from '@redwoodjs/cli-helpers';
import {
  builder as functionBuilder,
  description as functionDescription,
  handler as functionHandler,
} from './function/command.js';
import {
  builder as pluginBuilder,
  description as pluginDescription,
  handler as pluginHandler,
} from './plugin/command.js';

export const scriptName = 'inngest-setup-redwoodjs';

let { cwd, help } = Parser(hideBin(process.argv));
// eslint-disable-next-line dot-notation
cwd ??= process.env['RWJS_CWD'];

try {
  if (cwd) {
    // `cwd` was set by the `--cwd` option or the `RWJS_CWD` env var. In this case,
    // we don't want to find up for a `redwood.toml` file. The `redwood.toml` should just be in that directory.
    if (!fs.existsSync(path.join(cwd, 'redwood.toml')) && !help) {
      throw new Error(`Couldn't find a "redwood.toml" file in ${cwd}`);
    }
  } else {
    // `cwd` wasn't set. Odds are they're in a Redwood project,
    // but they could be in ./api or ./web, so we have to find up to be sure.

    const redwoodTOMLPath = findup('redwood.toml', { cwd: process.cwd() });

    if (!redwoodTOMLPath && !help) {
      throw new Error(`Couldn't find up a "redwood.toml" file from ${process.cwd()}`);
    }

    if (redwoodTOMLPath) {
      cwd = path.dirname(redwoodTOMLPath);
    }

    if (!isTypeScriptProject()) {
      throw new Error(
        `Inngest works best with TypeScript. Please run \`yarn rw setup typescript\` to convert your project to TypeScript first.`,
      );
    }
  }
} catch (error) {
  if (error instanceof Error) {
    // eslint-disable-next-line no-console
    console.error(error.message);
  }

  process.exit(1);
}

// eslint-disable-next-line dot-notation
process.env['RWJS_CWD'] = cwd;

// export const command = 'plugin <command>';

yargs
  .demandCommand()
  .scriptName(scriptName)
  .option('cwd', {
    type: 'string',
    demandOption: false,
    description: 'Working directory to use (where `redwood.toml` is located)',
  })
  .command('plugin', pluginDescription, pluginBuilder, pluginHandler)
  .command('function <name>', functionDescription, functionBuilder, functionHandler)
  .parse();
