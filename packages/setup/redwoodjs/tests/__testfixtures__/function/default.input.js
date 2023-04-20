import { serve } from 'inngest/redwood';

import { INNGEST_APP_NAME } from 'src/inngest/client';
import helloWorld from 'src/inngest/helloWorld';

const inngestFunctions = [helloWorld];

export const handler = serve(INNGEST_APP_NAME, inngestFunctions, {
  servePath: '/inngest',
  // signingKey: 'Redwood',
});
