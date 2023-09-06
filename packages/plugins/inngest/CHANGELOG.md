# envelop-plugin-inngest

## 1.1.0

### Minor Changes

- [#156](https://github.com/inngest/envelop-plugin-inngest/pull/156)
  [`2446212`](https://github.com/inngest/envelop-plugin-inngest/commit/2446212f46c27cb676e2071679f5759b78993da6)
  Thanks [@dthyresson](https://github.com/dthyresson)! - Updates to Inngest SDK 2.1.0

## 1.0.0

### Major Changes

- [#153](https://github.com/inngest/envelop-plugin-inngest/pull/153)
  [`6026af1`](https://github.com/inngest/envelop-plugin-inngest/commit/6026af16647d5d7daf71027521e40ebeea3876e7)
  Thanks [@dthyresson](https://github.com/dthyresson)! - Updates to Inngest SDK v2

  ## Breaking Changes

  Inngest SDK v2 has some breaking changes that will require some manual code change to existing
  apps.

  ### Logging

  Logging has changed in v2. See: https://www.inngest.com/docs/guides/logging.

  It is now set in the client and used as part of Inngest's middleware. The plugin will try to use
  the Inngest client's logger first and then this logger setting.

  ```ts
  // api/src/lib/inngest.ts
  import { Inngest } from 'inngest';
  import { logger } from './logger';

  export const INNGEST_APP_NAME = 'Redwood_Inngest';

  export const inngest = new Inngest({
    /**
     * The name of this instance, most commonly the name of the application it
     * resides in.
     */
    name: INNGEST_APP_NAME,
    /**
     * Inngest event key, used to send events to Inngest Cloud. If not provided,
     * will search for the `INNGEST_EVENT_KEY` environment variable. If neither
     * can be found, however, a warning will be shown and any attempts to send
     * events will throw an error.
     */
    eventKey: 'YOUR_INNGEST_EVENT_KEY',
    /**
     * Use the api logger for Inngest function logging, useful in scheduled functions
     */
    logger: logger,
    logLevel: 'info',
  });
  ```

  ### Delayed Functions

  In addition to delaying via a `sleep` duration, you can now `sleepUntil` a timestamp or a variable
  in event data:

  ```ts
    async ({ event, step }) => {
       await step.sleep('5s')

       // You can run jobs at a specific time using the step.sleepUntil() utility:
       // await step.sleepUntil("2023-04-01T12:30:00");

       // You can also sleep until a timestamp within the event data.  This lets you
       // pass in a time for you to run the job:
       // await step.sleepUntil(event.data.run_at) // Assuming event.data.run_at is a timestamp.
  ```

  ### Scheduled Functions

  A scheduled function now uses the logger to output success rather than a payload message.

  Note that one can access Inngest's `logger` set on the client from the `event`:

  ```ts
    async (event) => {
       const payload = {
         message: `Scheduled ${humanizedName} function ran.`,
         runAt: Date.now().toString(),
       }
       event.logger.debug(payload, `${humanizedName} function ran.`)
     }
   )
  ```

  ### RedwoodJS

  1. The `api/src/functions/inngest.ts` function has several changes:

  - In the `serve` handler, instead of the `INNGEST_APP_NAME` now one passes the complete `inngest`
    client.

  ```ts
  // Serve your Inngest functions
  export const handler = serve(inngest, inngestFunctions,
  ```

  This name is still defined in `api/src/lib/inngest.ts`:

  ```ts
  export const INNGEST_APP_NAME = 'Redwood_Inngest'

  export const inngest = new Inngest({
    /**
     * The name of this instance, most commonly the name of the application it
     * resides in.
     */
    name: INNGEST_APP_NAME,
  ```

  2. RedwoodJS v6 canary builds may need the `serve` path to be
     `servePath: '/.redwood/functions/inngest'` instead of simply `/inngest`.

  One you then start the Inngest dev server as:

  ```bash
  npx inngest-cli@latest dev -u http://localhost:8910/.redwood/functions/inngest
  ```

## 0.5.5

### Patch Changes

- [#150](https://github.com/inngest/envelop-plugin-inngest/pull/150)
  [`7b31865`](https://github.com/inngest/envelop-plugin-inngest/commit/7b318654bc84646d46387085bd1aa8b42ffb1540)
  Thanks [@dthyresson](https://github.com/dthyresson)! - Upgrade to Inngest SDK 1.9.7

## 0.5.4

### Patch Changes

- [#113](https://github.com/inngest/envelop-plugin-inngest/pull/113)
  [`66c30a1`](https://github.com/inngest/envelop-plugin-inngest/commit/66c30a12ea705fc3aea4bdc28b710566e1cb8481)
  Thanks [@renovate](https://github.com/apps/renovate)! - Update dependency inngest to v1.8.4

## 0.5.3

### Patch Changes

- [#118](https://github.com/inngest/envelop-plugin-inngest/pull/118)
  [`f9d4a41`](https://github.com/inngest/envelop-plugin-inngest/commit/f9d4a41cff4a3d5db2325d39622072af86f62cca)
  Thanks [@dthyresson](https://github.com/dthyresson)! - Updates inngest sdk to 1.8.2

## 0.5.2

### Patch Changes

- [#115](https://github.com/inngest/envelop-plugin-inngest/pull/115)
  [`e80db3a`](https://github.com/inngest/envelop-plugin-inngest/commit/e80db3a089be3b03f36b871c7d66d1baa6c8bc81)
  Thanks [@dthyresson](https://github.com/dthyresson)! - Upgrade to inngest sdk v1.8.1

## 0.5.1

### Patch Changes

- [#112](https://github.com/inngest/envelop-plugin-inngest/pull/112)
  [`8297e0d`](https://github.com/inngest/envelop-plugin-inngest/commit/8297e0dc22d8a54a75445f20101425a7b2b9b0c1)
  Thanks [@dthyresson](https://github.com/dthyresson)! - Updates latest dependencies

- [#110](https://github.com/inngest/envelop-plugin-inngest/pull/110)
  [`3dc8fb6`](https://github.com/inngest/envelop-plugin-inngest/commit/3dc8fb68156cfd5360acd101984d44c9411f5b5f)
  Thanks [@dthyresson](https://github.com/dthyresson)! - Updates various dependencies

## 0.5.0

### Minor Changes

- [#82](https://github.com/inngest/envelop-plugin-inngest/pull/82)
  [`9a0859c`](https://github.com/inngest/envelop-plugin-inngest/commit/9a0859c2b142fbeace9d7c3532fb83551986f42d)
  Thanks [@dthyresson](https://github.com/dthyresson)! - Fixed
  https://github.com/inngest/envelop-plugin-inngest/issues/66 where event names for capitalized
  operation names are built incorrectly

## 0.4.0

### Minor Changes

- [#72](https://github.com/inngest/envelop-plugin-inngest/pull/72)
  [`974abc6`](https://github.com/inngest/envelop-plugin-inngest/commit/974abc6c46cba7111cff5d0ee0996dd60a78ea71)
  Thanks [@dthyresson](https://github.com/dthyresson)! - Reorganizes jobs directory. Updates to
  latest inngest sdk.

- [#72](https://github.com/inngest/envelop-plugin-inngest/pull/72)
  [`dc1a886`](https://github.com/inngest/envelop-plugin-inngest/commit/dc1a886e5d9ba1bd885f3480a925d3273e7c62dd)
  Thanks [@dthyresson](https://github.com/dthyresson)! - Package updates

## 0.3.0

### Minor Changes

- [#68](https://github.com/inngest/envelop-plugin-inngest/pull/68)
  [`3459771`](https://github.com/inngest/envelop-plugin-inngest/commit/3459771312730af29422e9ce6792f629f76efc53)
  Thanks [@dthyresson](https://github.com/dthyresson)! - Assorted package dependency updates

## 0.2.0

### Minor Changes

- [#30](https://github.com/inngest/envelop-plugin-inngest/pull/30)
  [`da47ffc`](https://github.com/inngest/envelop-plugin-inngest/commit/da47ffc03fd4d3158acfd6e9466a629ebb0787ef)
  Thanks [@dthyresson](https://github.com/dthyresson)! - Use latest inngest sdk v1.7.0

## 0.1.0

### Minor Changes

- [#3](https://github.com/inngest/envelop-plugin-inngest/pull/3)
  [`19921b6`](https://github.com/inngest/envelop-plugin-inngest/commit/19921b628b048c4273f98dba74b49c79f65f9e1a)
  Thanks [@dthyresson](https://github.com/dthyresson)! - Updates Inngest client to 1.3.5

- [`44a77a4`](https://github.com/inngest/envelop-plugin-inngest/commit/44a77a4fd5a904736d039542c6df87950e6c1c90)
  Thanks [@dthyresson](https://github.com/dthyresson)! - Initial release
