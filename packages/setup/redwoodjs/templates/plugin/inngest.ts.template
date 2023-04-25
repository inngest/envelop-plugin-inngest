import { serve } from 'inngest/redwood'

import helloWorld from 'src/jobs/inngest/helloWorld'
import { INNGEST_APP_NAME } from 'src/lib/inngest'

// Add your Inngest functions here
const inngestFunctions = [helloWorld]

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
})
