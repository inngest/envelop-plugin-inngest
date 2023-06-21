---
'envelop-plugin-inngest': major
'inngest-setup-redwoodjs': major
---

Updates to Inngest SDK v2

## Breaking Changes

Inngest SDK v2 has some breaking changes that will require some manual code change to existing apps.

### Logging

Logging has changed in v2. See: https://www.inngest.com/docs/guides/logging.

It is now set in the client and used as part of Inngest's middleware. The plugin will try to use the
Inngest client's logger first and then this logger setting.

```ts
// api/src/lib/inngest.ts
import { Inngest } from 'inngest'
import { logger } from './logger'

export const INNGEST_APP_NAME = 'Redwood_Inngest'

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
  logLevel: 'info'
})
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
