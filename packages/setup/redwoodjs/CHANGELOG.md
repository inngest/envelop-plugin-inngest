# inngest-setup-redwoodjs

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
  import { loadCronJobFanOut } from 'src/jobs/inngest/loadCronJob';
  import { loadCronJob } from 'src/jobs/inngest/loadCronJob';
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
