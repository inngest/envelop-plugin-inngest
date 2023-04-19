# inngest-setup-redwoodjs

Setup up Inngest in a RedwoodJS project and to create new functions via command line.

The `plugin` command configures Inngest and auto-instruments the RedwoodJS GraphQL api using the `envelop-plugin-inngest plugin`.

The `function` command creates stubbed out background, delayed, scheduled and step functions ready for you to implement.

## Usage

```
yarn dlx inngest-setup-redwoodjs plugin
yarn dlx inngest-setup-redwoodjs function <name> -t <type>
```

Run the above commands inside your RedwoodJS project.

### Plugin Command

```
yarn dlx inngest-setup-redwoodjs plugin
```

The plugin command will configure a RedwoodJS project to use Inngest and auto-instrument the GraphQL API.

- installs required Inngest packages
- sets up all needed inngest files
- creates the plugin for RedwoodJS GraphQLHandler
- runs a codemod to transform the GraphQLHandler to use the Inngest plugin

Tests for codemod and included.

See: [envelop-plugin-inngest README](https://github.com/inngest/envelop-plugin-inngest/tree/main/packages/plugins/inngest) for more information about the plugin.

### Function Command

```
yarn dlx inngest-setup-redwoodjs function <name> -t <type>
```

The function command will create a new file for the selected function type ready to implement.

Supported types are:

- background
- delayed
- scheduled
- step

See [Writing Functions](https://www.inngest.com/docs/functions) in the Inngest documentation for more info.

Important: In order to use Inngest functions, the plugin command should be run first to configure and setup your RedwoodJS app to use Inngest.

## Note

Currently these commands only work for RedwoodJS projects with TypeScript.

### Releasing

It's made to be released by npm (e.g. `npm run release:patch`). That way I don't have to worry about yarn v1 vs v3
