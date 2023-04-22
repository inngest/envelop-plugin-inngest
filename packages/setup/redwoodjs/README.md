# inngest-setup-redwoodjs

Setup up Inngest in a RedwoodJS project and to create new functions via command line.

The `plugin` command configures Inngest and auto-instruments the RedwoodJS GraphQL api using the
`envelop-plugin-inngest plugin`.

The `function` command creates stubbed out background, delayed, scheduled and step functions ready
for you to implement.

## Installation

Add the `inngest-setup-redwoodjs` package to your RedwoodJS project's `package.json` as a
development dependency:

```
yarn add -D inngest-setup-redwoodjs
```

For example:

```
  // package.json]
  "devDependencies": {
    ...
    "inngest-setup-redwoodjs": "latest"
  },
```

## Usage

```
yarn inngest-setup-redwoodjs plugin
yarn inngest-setup-redwoodjs function <name> -t <type>
```

Run the above commands inside your RedwoodJS project.

## Plugin Command

```
yarn inngest-setup-redwoodjs plugin
```

The plugin command will configure a RedwoodJS project to use Inngest and auto-instrument the GraphQL
API.

- installs required Inngest packages
- sets up all needed inngest files
- creates the plugin for RedwoodJS GraphQLHandler
- runs a codemod to transform the GraphQLHandler to use the Inngest plugin

Tests for codemod and included.

See:
[envelop-plugin-inngest README](https://github.com/inngest/envelop-plugin-inngest/tree/main/packages/plugins/inngest)
for more information about the plugin.

### Files Added by Plugin Setup

After running the `plugin` command, the following files are setup in your RedwoodJS project api
side:

```terminal
- api
 +-- src
  +-- functions
      +- graphql.ts         // Modified GraphQLHandler to use Inngest plugin to instrument GraphQL api
      +- inngest.ts         // Inngest endpoint to serve functions
  +-- inngest               // Directory where Inngest functions are stored
      +- helloWorld.ts      // Example background function
  +-- lib
      +- inngest.ts         // Inngest client. Use this if you need to send custom events in services or functions.
  +-- plugin
        +- useInngest.ts    // GraphQL Yoga plugin that auto-instruments GraphQL api
```

Also, your project's `package.json` file is modified to add a scrip that can launch the Inngest dev
server quickly:

```json file="package.json"
  "scripts": {
    "inngest:dev": "npx inngest-cli@latest dev -u http://localhost:8911/inngest",
  }
```

### Next Steps

1. Update `INNGEST_APP_NAME` and `eventKey` custom to your application

```
// api/src/inngest/client.ts

export const inngest = new Inngest({
  name: INNGEST_APP_NAME,
  eventKey: 'Redwood',
})
```

## Function Command

```
yarn inngest-setup-redwoodjs function <name> -t <type>
```

The function command will create a new ready tom implement function file for the provided function
type.

Supported types are:

- background
- delayed
- scheduled
- step

Note: if you omit the type argument, you will be prompted to pick a supported function type.

See [Writing Functions](https://www.inngest.com/docs/functions) in the Inngest documentation for
more info.

Important: In order to use Inngest functions, the plugin command should be run first to configure
and setup your RedwoodJS app to use Inngest.

## Inngest Dev Server

To launch the Inngest dev server, from a new terminal run:

```
npx inngest-cli@latest dev -u http://localhost:8911/inngest
```

Note: The endpoint needs to match the `servePath` (e.g., '/inngest') defined in
`api/src/functions/inngest.ts`.

## Tip!

The `plugin` command adds a script to your `package.json` to make to easier to launch the Inngest
Dev Server.

Simply run:

```
yarn inngest:dev
```

Or, you can add manually by adding this script to your application's `package.json` like

```
  "scripts": {
    "inngest:dev": "npx inngest-cli@latest dev -u http://localhost:8911/inngest"
  }
```

## Important

Currently these commands only work for RedwoodJS projects with TypeScript.

## Releasing

It's made to be released by npm (e.g. `npm run release:patch`). That way I don't have to worry about
yarn v1 vs v3
