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
