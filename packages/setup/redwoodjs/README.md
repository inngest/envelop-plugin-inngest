# inngest-setup-redwoodjs

Command for setting up Inngest background jobs and events support in a RedwoodJS project and auto-instrument the GraphQL api via the envelop-plugin-inngest plugin.

## Usage

```
yarn dlx inngest-setup-redwoodjs
```

Run the command above inside your RW project and it'll install and create the Inngest client in your RedwoodJS project.

## Command

The setup command will configure a RedwoodJS project to use inngest and auto-instrument the Gra[phQL API.]

- installs required Inngest packages
- sets up all needed inngest files
- creates the plugin for RedwoodJS GraphQLHandler
- runs a codemod to transform the GraphQLHandler to use the Inngest plugin

Tests for codemod and included.

## Note

Currently this setup command only works for RedwoodJS projects with TypeScript.

### Releasing

It's made to be released by npm (e.g. `npm run release:patch`). That way I don't have to worry about yarn v1 vs v3
