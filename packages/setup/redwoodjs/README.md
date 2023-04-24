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
yarn inngest-setup-redwoodjs function <name> -t <type> [--graphql]
```

Run the above commands inside your RedwoodJS project.

Note: only `name` is required. This will become the name of your function.

If `type` is not provided, you will be prompted to pick from the support function types.

If set `--graphql` then you will be prompted to pick from available queries and mutations in your
web app. You then will be prompted to pick a function type. Note that you cannon created scheduled
(aka cron) functions for graphql events,

## Plugin Command

```
yarn inngest-setup-redwoodjs plugin

Set up Inngest plugin

Options:
      --help     Show help                                             [boolean]
      --version  Show version number                                   [boolean]
      --cwd      Working directory to use (where `redwood.toml` is located)
                                                                        [string]
  -f, --force    Overwrite existing files             [boolean] [default: false]
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
// api/src/inngest/lib/inngest.ts

export const inngest = new Inngest({
  name: INNGEST_APP_NAME,
  eventKey: 'YOUR_INNGEST_EVENT_KEY',
})
```

“Event Keys” are unique keys that allow applications to send (aka publish) events to Inngest.

If the `eventKey` is not provided, Inngest will look for and use the `INNGEST_EVENT_KEY` environment
variable.

During local development, you can use a dummy value for your `INNGEST_EVENT_KEY` environment
variable. The dev server does not validate keys locally.

For more information, see
[Creating an event key](https://www.inngest.com/docs/events/creating-an-event-key) in teh Inngest
documentation.

## Function Command

```
yarn inngest-setup-redwoodjs function <name> -t <type> [--graphql]

Set up an Inngest function

Positionals:
  name  Name of the function to setup                        [string] [required]

Options:
      --help       Show help                                           [boolean]
      --version    Show version number                                 [boolean]
      --cwd        Working directory to use (where `redwood.toml` is located)
                                                                        [string]
      --eventName  Name of the event to trigger the function. Defaults to the
                   function name.                                       [string]
      --graphql    Build event name from your web side GraphQL operations
                                                      [boolean] [default: false]
  -t, --type       Type of Inngest function to setup
                [string] [choices: "background", "scheduled", "delayed", "step"]
  -f, --force      Overwrite existing files           [boolean] [default: false]

```

The function command will create a new ready tom implement function file for the provided function
type.

Supported types are:

- [background](https://www.inngest.com/docs/guides/background-jobs)
- [delayed](https://www.inngest.com/docs/guides/enqueueing-future-jobs)
- [scheduled](https://www.inngest.com/docs/guides/scheduled-functions)
- [step](https://www.inngest.com/docs/functions/multi-step)
- (coming soon - fan out)

Note: if you omit the type argument, you will be prompted to pick a supported function type.

See [Writing Functions](https://www.inngest.com/docs/functions) in the Inngest documentation for
more info.

Important: In order to use Inngest functions, the plugin command should be run first to configure
and setup your RedwoodJS app to use Inngest.

## Inngest SDk Dashboard

To launch the SDK Dashboard, visit:

```
http://localhost:8911/inngest
```

Here, you can see which functions have be been found and registered.

## Inngest Dev Server

To launch the Inngest dev server, from a new terminal run:

```
npx inngest-cli@latest dev -u http://localhost:8911/inngest
```

Please be sure to start your RedwoodJS Dev Server as well; preferably before launching the Inngest
Dev server. If not, you may see some connection warnings until both servers are up.

Note: The endpoint needs to match the `servePath` (e.g., '/inngest') defined in
`api/src/functions/inngest.ts`.

### Inngest Signing Key

In Production, an `INNGEST_SIGNING_KEY` is required to securely communicate with the Inngest
platform, either via environment variable (recommend) or it can be passed explicitly through the
options argument.

It signs requests to and from Inngest in order to prove that the source is legitimate.

In local development, a `INNGEST_SIGNING_KEY` isn't needed; however, when the Inngest Dev Server
starts, you may see an warning message:

```
You're missing the INNGEST_SIGNING_KEY parameter when serving your functions.
```

You must provide a signing key to communicate securely with Inngest when sending non-development
events. If your key is not provided here, we'll try to retrieve it from the `INNGEST_SIGNING_KEY`
environment variable.

You can retrieve your signing key from the Inngest UI inside the "Secrets" section at {@link
https://app.inngest.com/secrets}. We highly recommend that you add this to your platform's available
environment variables as `INNGEST_SIGNING_KEY`.

When in Production, if no key can be found, you will not be able to register your functions or
receive events from Inngest.

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
