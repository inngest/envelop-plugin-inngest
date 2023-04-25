import { serve } from 'inngest/redwood';
import { INNGEST_APP_NAME } from 'src/lib/inngest';

const inngestFunctions = [];

export const handler = serve(INNGEST_APP_NAME, inngestFunctions, {
  servePath: '/inngest',
  // signingKey: 'Redwood',
});
