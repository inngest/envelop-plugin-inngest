import { serve } from 'inngest/redwood';
import helloWorld from 'src/jobs/inngest/helloWorld';
import { INNGEST_APP_NAME } from 'src/lib/inngest';

const inngestFunctions = [helloWorld];

export const handler = serve(INNGEST_APP_NAME, inngestFunctions, {
  servePath: '/inngest',
  // signingKey: 'Redwood',
});
