---
'inngest-setup-redwoodjs': minor
---

Setup function now supports fan out jobs.

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

This was done so that it would be easier to register multiple functions from the same file which was
needed to support fan out functions.

For example:

```ts
import { serve } from 'inngest/redwood'
import helloWorld from 'src/jobs/inngest/helloWorld'
import { loadCronJobFanOut } from 'src/jobs/inngest/loadCronJob'
import { loadCronJob } from 'src/jobs/inngest/loadCronJob'
import { onCar } from 'src/jobs/inngest/onCar'
import { onCarDelete } from 'src/jobs/inngest/onCarDelete'
import { INNGEST_APP_NAME } from 'src/lib/inngest'

// Add your Inngest functions here
const inngestFunctions = [helloWorld, loadCronJob, loadCronJobFanOut, onCar, onCarDelete]

// Serve your Inngest functions
export const handler = serve(INNGEST_APP_NAME, inngestFunctions, {
  servePath: '/inngest',
  /**
   * The minimum level to log from the Inngest serve endpoint.
   *
   * Default level: "info"
   */
  logLevel: 'info'
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
})
```
