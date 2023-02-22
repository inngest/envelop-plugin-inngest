# envelop-plugin-inngest

An envelop plugin that sends GraphQL response data to Inngest to help build event-driven applications.

`useInngest` is an [Envelop](https://envelop.dev/) plugin for [GraphQL Yoga](https://envelop.dev/) and servers or frameworks powered by Yoga, such as [RedwoodJS](https://www.redwoodjs.com).

It's philosophy is to:

- "instrument everything" by sending events for each GraphQL execution result to [Inngest](https://www.inngest.com) to effortlessly build event-driven applications.
- provide fine-grained control over what events are sent such as operations (queries, mutations, or subscriptions), introspection events, when GraphQL errors occur, if result data should be included, type and schema coordinate denylists ... and more.
- be customized with event prefix, name and user context functions
