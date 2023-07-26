# inngest-setup-redwoodjs

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

## 0.4.5

### Patch Changes

- [#150](https://github.com/inngest/envelop-plugin-inngest/pull/150)
  [`7b31865`](https://github.com/inngest/envelop-plugin-inngest/commit/7b318654bc84646d46387085bd1aa8b42ffb1540)
  Thanks [@dthyresson](https://github.com/dthyresson)! - Upgrade to Inngest SDK 1.9.7

## 0.4.4

### Patch Changes

- [#115](https://github.com/inngest/envelop-plugin-inngest/pull/115)
  [`e80db3a`](https://github.com/inngest/envelop-plugin-inngest/commit/e80db3a089be3b03f36b871c7d66d1baa6c8bc81)
  Thanks [@dthyresson](https://github.com/dthyresson)! - Upgrade to inngest sdk v1.8.1

## 0.4.3

### Patch Changes

- [#112](https://github.com/inngest/envelop-plugin-inngest/pull/112)
  [`8297e0d`](https://github.com/inngest/envelop-plugin-inngest/commit/8297e0dc22d8a54a75445f20101425a7b2b9b0c1)
  Thanks [@dthyresson](https://github.com/dthyresson)! - Updates latest dependencies

- [#110](https://github.com/inngest/envelop-plugin-inngest/pull/110)
  [`3dc8fb6`](https://github.com/inngest/envelop-plugin-inngest/commit/3dc8fb68156cfd5360acd101984d44c9411f5b5f)
  Thanks [@dthyresson](https://github.com/dthyresson)! - Updates various dependencies

## 0.4.2

### Patch Changes

- [#108](https://github.com/inngest/envelop-plugin-inngest/pull/108)
  [`ae31562`](https://github.com/inngest/envelop-plugin-inngest/commit/ae3156231c4d60a9f441a1f2bfad29a49ad889aa)
  Thanks [@dthyresson](https://github.com/dthyresson)! - Improves the way RedwoodJS integrates its
  experimental setup cli command.

## 0.4.1

### Patch Changes

- [#100](https://github.com/inngest/envelop-plugin-inngest/pull/100)
  [`a3cceee`](https://github.com/inngest/envelop-plugin-inngest/commit/a3cceeebb4b20bff0cc8229856ba8ba459e49b04)
  Thanks [@dthyresson](https://github.com/dthyresson)! - Supports RedwoodJS experimental packages
  config

## 0.4.0

### Minor Changes

- [#91](https://github.com/inngest/envelop-plugin-inngest/pull/91)
  [`421ea29`](https://github.com/inngest/envelop-plugin-inngest/commit/421ea291e6383cdcd576f0027cf977ab26d60c1a)
  Thanks [@dthyresson](https://github.com/dthyresson)! - Setup function now supports fan out jobs.

  `yarn inngest-setup-redwoodjs function -t fan-out'

  Sometimes you might need to trigger new functions from existing functions, for example when you’re
  developing a complex workflow or performing work for more than one object (eg. a group of users,
  products, orders). You can achieve this via fan-out, which:

  - Allows functions to call other functions, which run in parallel
  - Makes your workflows more reliable, as each function has its own retries and will fail
    individually on permanent errors
  - Provides insight and tracing, allowing you to see the relationships between functions

  See: https://www.inngest.com/docs/guides/fan-out-jobs

  ## Breaking Changes

  Setup functions are no longer default exported:

  ```
  const loadCronJob = inngest.createFunction()

  default export loadCronJob
  ```

  is now

  ```
  export const loadCronJob = inngest.createFunction()
  ```

  This was done so that it would be easier to register multiple functions from the same file which
  was needed to support fan out functions.

  For example:

  ```ts
  import { serve } from 'inngest/redwood';
  import helloWorld from 'src/jobs/inngest/helloWorld';
  import { loadCronJob, loadCronJobFanOut } from 'src/jobs/inngest/loadCronJob';
  import { onCar } from 'src/jobs/inngest/onCar';
  import { onCarDelete } from 'src/jobs/inngest/onCarDelete';
  import { INNGEST_APP_NAME } from 'src/lib/inngest';

  // Add your Inngest functions here
  const inngestFunctions = [helloWorld, loadCronJob, loadCronJobFanOut, onCar, onCarDelete];

  // Serve your Inngest functions
  export const handler = serve(INNGEST_APP_NAME, inngestFunctions, {
    servePath: '/inngest',
    /**
     * The minimum level to log from the Inngest serve endpoint.
     *
     * Default level: "info"
     */
    logLevel: 'info',
    /**
     * A key used to sign requests to and from Inngest in order to prove that the
     * source is legitimate in Production.
     *
     * You must provide a signing key to communicate securely with Inngest. If
     * your key is not provided here, we'll try to retrieve it from the
     * `INNGEST_SIGNING_KEY` environment variable.
     *
     * You can retrieve your signing key from the Inngest UI inside the "Secrets"
     * section at {@link https://app.inngest.com/env/production/manage/signing-key}. We highly recommend
     * that you add this to your platform's available environment variables as
     * `INNGEST_SIGNING_KEY`.
     *
     * If no key can be found, you will not be able to register your functions or
     * receive events from Inngest.
     *
     * Note: This is not required for local development.
     */
    // signingKey: 'YOUR-SIGNING-KEY',
  });
  ```

## 0.3.0

### Minor Changes

- [#72](https://github.com/inngest/envelop-plugin-inngest/pull/72)
  [`5795929`](https://github.com/inngest/envelop-plugin-inngest/commit/5795929a58176c5fa8022f7549de9477daeac12a)
  Thanks [@dthyresson](https://github.com/dthyresson)! - Generate functions for your GraphQL queries
  and mutations.

- [#72](https://github.com/inngest/envelop-plugin-inngest/pull/72)
  [`dc1a886`](https://github.com/inngest/envelop-plugin-inngest/commit/dc1a886e5d9ba1bd885f3480a925d3273e7c62dd)
  Thanks [@dthyresson](https://github.com/dthyresson)! - Package updates

## 0.2.1

### Patch Changes

- [#68](https://github.com/inngest/envelop-plugin-inngest/pull/68)
  [`3459771`](https://github.com/inngest/envelop-plugin-inngest/commit/3459771312730af29422e9ce6792f629f76efc53)
  Thanks [@dthyresson](https://github.com/dthyresson)! - Updated to latest inngest sdk, other
  packages, and installation and usage instructions.

## 0.2.0

### Minor Changes

- [#30](https://github.com/inngest/envelop-plugin-inngest/pull/30)
  [`da47ffc`](https://github.com/inngest/envelop-plugin-inngest/commit/da47ffc03fd4d3158acfd6e9466a629ebb0787ef)
  Thanks [@dthyresson](https://github.com/dthyresson)! - Use latest inngest sdk v1.7.0

## 0.1.0

### Minor Changes

- [#25](https://github.com/inngest/envelop-plugin-inngest/pull/25)
  [`0e688b7`](https://github.com/inngest/envelop-plugin-inngest/commit/0e688b797a65a9ad3195c88092d6931d07802bec)
  Thanks [@dthyresson](https://github.com/dthyresson)! - Initial setup command release
