# envelop-plugin-inngest

An envelop plugin that sends GraphQL response data to Inngest to help build event-driven
applications.

`useInngest` is an [Envelop](https://envelop.dev/) plugin for [GraphQL Yoga](https://envelop.dev/)
and servers or frameworks powered by Yoga, such as [RedwoodJS](https://www.redwoodjs.com).

It's philosophy is to:

- "instrument everything" by sending events for each GraphQL execution result to
  [Inngest](https://www.inngest.com) to effortlessly build event-driven applications.
- provide fine-grained control over what events are sent such as operations (queries, mutations, or
  subscriptions), introspection events, when GraphQL errors occur, if result data should be
  included, type and schema coordinate denylists ... and more.
- be customized with event prefix, name and user context functions

# Getting Started

```terminal
yarn add envelop-plugin-inngest
```

> **Note:** If you use RedwoodJS v5.0.6-canary or later, you can setup Inngest via
> `yarn rw experimental setup-inngest`.

## Usage Example

When configuring `useInngest`, you will need to setup and setup an
[Inngest client](https://www.inngest.com/docs/quick-start) with the necessary
[event keys](https://www.inngest.com/docs/events/creating-an-event-key).

```ts
import { useInngest } from 'envelop-plugin-inngest'
import { createSchema, createYoga } from 'graphql-yoga'
import { Inngest } from 'inngest'

const inngestClient = new Inngest({ name: 'My App' })

// Provide your schema
const yoga = createYoga({
  schema: createSchema({
    typeDefs: /* GraphQL */ `
      type Query {
        greetings: String!
      }
    `,
    resolvers: {
      Query: {
        greetings: () => 'Hello World!'
      }
    }
  }),
  plugins: [useInngest({ inngestClient })]
})

// Start the server and explore http://localhost:4000/graphql
const server = createServer(yoga)
server.listen(4000, () => {
  console.info('Server is running on http://localhost:4000/graphql')
})
```

### Logging

Logging has changed in v2. See: https://www.inngest.com/docs/guides/logging. It is now set in the
client and used as part of Inngest's middleware. The plugin will try to use the Inngest client's
logger first and then this logger setting.

You may set any
[Yoga-compatible logger](https://the-guild.dev/graphql/yoga-server/docs/features/logging-and-debugging)

```ts
import { useInngest } from 'envelop-plugin-inngest'
import { createLogger, createSchema, createYoga } from 'graphql-yoga'
import { Inngest } from 'inngest'

const inngestClient = new Inngest({ name: 'My App' })
const logger = createLogger()

// Provide your schema
const yoga = createYoga({
  schema: createSchema({
    typeDefs: /* GraphQL */ `
      type Query {
        greetings: String!
      }
    `,
    resolvers: {
      Query: {
        greetings: () => 'Hello World!'
      }
    }
  }),
  plugins: [useInngest({ inngestClient, logging: logger })]
})
```

#### Disable Logging

```ts
import { useInngest } from 'envelop-plugin-inngest'
import { createLogger, createSchema, createYoga } from 'graphql-yoga'
import { Inngest } from 'inngest'

const inngestClient = new Inngest({ name: 'My App' })
const logger = createLogger()

// Provide your schema
const yoga = createYoga({
  schema: createSchema({
    typeDefs: /* GraphQL */ `
      type Query {
        greetings: String!
      }
    `,
    resolvers: {
      Query: {
        greetings: () => 'Hello World!'
      }
    }
  }),
  plugins: [useInngest({ inngestClient, logging: false })]
})
```

#### Set Log Level

```ts
import { useInngest } from 'envelop-plugin-inngest'
import { createLogger, createSchema, createYoga } from 'graphql-yoga'
import { Inngest } from 'inngest'

const inngestClient = new Inngest({ name: 'My App' })
const logger = createLogger()

// Provide your schema
const yoga = createYoga({
  schema: createSchema({
    typeDefs: /* GraphQL */ `
      type Query {
        greetings: String!
      }
    `,
    resolvers: {
      Query: {
        greetings: () => 'Hello World!'
      }
    }
  }),
  plugins: [useInngest({ inngestClient, logging: 'warn' })]
})
```

### Custom Event Payload Functions

You may need to customize the event name prefix or event name from its defaults.

The event name prefix is `graphql` and the event name is constructed based on the operation name
(aka the `noun` and type (aka the `verb`).

For example, the event name for a query of:

```
query TestQuery { test }
```

will be `graphql/test-query.query`

#### Build Custom Event Name

In the case where you want to completely override the function to construct the entire event name,
you can define a `buildEventNameFunction`:

```ts
import { useInngest } from 'envelop-plugin-inngest'
import { createSchema, createYoga } from 'graphql-yoga'
import { Inngest } from 'inngest'

const inngestClient = new Inngest({ name: 'My App' })

// Provide your schema
const yoga = createYoga({
  schema: createSchema({
    typeDefs: /* GraphQL */ `
      type Query {
        greetings: String!
      }
    `,
    resolvers: {
      Query: {
        greetings: () => 'Hello World!'
      }
    }
  }),
  plugins: [
    useInngest({
      inngestClient,
      buildEventNameFunction: async () => 'custom-graphql/noun.verb'
    })
  ]
})
```

#### Build Custom Event Name Prefix

The `buildEventNamePrefixFunction` option lets you pass a function to customize the prefix for the
event name

```ts
import { useInngest } from 'envelop-plugin-inngest'
import { createSchema, createYoga } from 'graphql-yoga'
import { Inngest } from 'inngest'

const inngestClient = new Inngest({ name: 'My App' })

// Provide your schema
const yoga = createYoga({
  schema: createSchema({
    typeDefs: /* GraphQL */ `
      type Query {
        greetings: String!
      }
    `,
    resolvers: {
      Query: {
        greetings: () => 'Hello World!'
      }
    }
  }),
  plugins: [
    useInngest({
      inngestClient,
      buildEventNamePrefixFunction: async () => 'custom-graphql'
    })
  ]
})
```

### User Context

Inngest can also send user context information with the event to contain the user that perform the
action.

The `buildUserContextFunction` option let's you define the user context info sent with teh event,
such as the authenticated user.

#### Build Custom User Context Info

```ts
import { useInngest } from 'envelop-plugin-inngest'
import { createSchema, createYoga } from 'graphql-yoga'
import { Inngest } from 'inngest'

const inngestClient = new Inngest({ name: 'My App' })

export const userContext: BuildUserContextFunction = (options: InngestUserContextOptions) => {
  const currentUser = options.params.args.contextValue.currentUser

  if (currentUser) {
    return { id: currentUser.id }
  }
  return {}
}

// Provide your schema
const yoga = createYoga({
  schema: createSchema({
    typeDefs: /* GraphQL */ `
      type Query {
        greetings: String!
      }
    `,
    resolvers: {
      Query: {
        greetings: () => 'Hello World!'
      }
    }
  }),
  plugins: [useInngest({ inngestClient, buildUserContextFunction: userContext })]
})
```

### Control What Events Sent

You may not want to send every GraphQL result to Inngest.

For example, you may want choose whether or not to send Subscriptions; or, you may want to send
errors; or, you may want to block and events when the result data includes particular types or
schema coordinates.

There are options that give you control over the defaults that:

- allows queries, mutations and subscription
- never sends introspections
- never sends errors
- never sends anonymous events

#### Only Send Certain Operations

To send only queries, configure the `sendOperations` option:

```ts
import { createSchema, createYoga } from 'graphql-yoga'
import { Inngest } from 'inngest'
import { SendableOperation, useInngest } from '@envelop/inngest'

const inngestClient = new Inngest({ name: 'My App' })

// Provide your schema
const yoga = createYoga({
  schema: createSchema({
    typeDefs: /* GraphQL */ `
      type Query {
        greetings: String!
      }
    `,
    resolvers: {
      Query: {
        greetings: () => 'Hello World!'
      }
    }
  }),
  plugins: [useInngest({ inngestClient, sendOperations: [SendableOperation.QUERY] })]
})
```

#### Send Errors

If you want to send the event even when an GraphQL Error occurs, you can set `sendErrors` to true.

Note: that in order for you to include the error information, you will also need to set
`includeRawResult` to `true` as well.

```ts
import { useInngest } from 'envelop-plugin-inngest'
import { createSchema, createYoga } from 'graphql-yoga'
import { Inngest } from 'inngest'

const inngestClient = new Inngest({ name: 'My App' })

// Provide your schema
const yoga = createYoga({
  schema: createSchema({
    typeDefs: /* GraphQL */ `
      type Query {
        greetings: String!
      }
    `,
    resolvers: {
      Query: {
        greetings: () => 'Hello World!'
      }
    }
  }),
  plugins: [useInngest({ inngestClient, sendErrors: true })]
})
```

#### Send Introspection Queries

If you want to send an event when an introspection query occurs, you can set `sendIntrospection` to
`true`:

```ts
import { useInngest } from 'envelop-plugin-inngest'
import { createSchema, createYoga } from 'graphql-yoga'
import { Inngest } from 'inngest'

const inngestClient = new Inngest({ name: 'My App' })

// Provide your schema
const yoga = createYoga({
  schema: createSchema({
    typeDefs: /* GraphQL */ `
      type Query {
        greetings: String!
      }
    `,
    resolvers: {
      Query: {
        greetings: () => 'Hello World!'
      }
    }
  }),
  plugins: [useInngest({ inngestClient, sendIntrospection: true })]
})
```

#### Send Anonymous Queries

If you want to send an event when an anonymous query occurs, you can set `sendAnonymousOperations`
to `true`.

Note: Anonymous query events will be send with an event name like
`graphql/anonymous-d32327f2ad0fef67462baf2b8410a2b4b2cc8db57e67bb5b3c95efa595b39f30.query` where an
operation id is generated based on the operation, document and variables in the request.

```ts
import { useInngest } from 'envelop-plugin-inngest'
import { createSchema, createYoga } from 'graphql-yoga'
import { Inngest } from 'inngest'

const inngestClient = new Inngest({ name: 'My App' })

// Provide your schema
const yoga = createYoga({
  schema: createSchema({
    typeDefs: /* GraphQL */ `
      type Query {
        greetings: String!
      }
    `,
    resolvers: {
      Query: {
        greetings: () => 'Hello World!'
      }
    }
  }),
  plugins: [useInngest({ inngestClient, sendAnonymousOperations: true })]
})
```

#### Do Not Send Events where Types or Schema Coordinates are in a Denylist

There may a reason to block sending the event if the result data contains information for a certain
type (like a `User`) or a particular schema coordinate (`Query.user`)

##### Deny list of Types

```ts
import { useInngest } from 'envelop-plugin-inngest'
import { createSchema, createYoga } from 'graphql-yoga'
import { Inngest } from 'inngest'

const inngestClient = new Inngest({ name: 'My App' })

// Provide your schema
const yoga = createYoga({
  schema: createSchema({
    typeDefs: /* GraphQL */ `
      type Query {
        greetings: String!
      }
    `,
    resolvers: {
      Query: {
        greetings: () => 'Hello World!'
      }
    }
  }),
  plugins: [useInngest({ inngestClient, denylist: { types: ['User'] } })]
})
```

##### Deny list of Schema Coordinates

```ts
import { useInngest } from 'envelop-plugin-inngest'
import { createSchema, createYoga } from 'graphql-yoga'
import { Inngest } from 'inngest'

const inngestClient = new Inngest({ name: 'My App' })

// Provide your schema
const yoga = createYoga({
  schema: createSchema({
    typeDefs: /* GraphQL */ `
      type Query {
        greetings: String!
      }
    `,
    resolvers: {
      Query: {
        greetings: () => 'Hello World!'
      }
    }
  }),
  plugins: [
    useInngest({
      inngestClient,
      denylist: { schemCoordinates: ['Query.user', 'Query.users'] }
    })
  ]
})
```

### Result Payload

By default, `useInngest` does not send the entire raw result `{data: {}, errors: []}` in the payload
because:

- Inngest has a max event payload of 512K and the information could be too large
- The information needed to process the event in the Inngest handler is sent instead as `types` and
  `identifiers`.

For example, if the query

```
query FindPost { post { id title } }
```

returns a single `Post`, the event payload will include the types in the result and the identifiers
(ie, Post with id of 1) such that you can fetch the current data for the posts and handle as needed:

```ts
{
  name: 'graphql/find-post.query',
  data: {
    variables: {},
    identifiers: [
      {
        id: '1',
        typename: 'Post',
      },
    ],
    types: ['Post'],
    result: {},
    operation: { id: 'find-post', name: 'FindPost', type: 'query' },
  },
  user: {},
}
```

You may send the complete raw result by setting `includeRawResult` to `true`:

```ts
import { useInngest } from 'envelop-plugin-inngest'
import { createSchema, createYoga } from 'graphql-yoga'
import { Inngest } from 'inngest'

const inngestClient = new Inngest({ name: 'My App' })

// Provide your schema
const yoga = createYoga({
  schema: createSchema({
    typeDefs: /* GraphQL */ `
      type Query {
        greetings: String!
      }
    `,
    resolvers: {
      Query: {
        greetings: () => 'Hello World!'
      }
    }
  }),
  plugins: [useInngest({ inngestClient, includeRawResult: true })]
})
```

### Redact Sensitive Information from Result Data

```ts
import { useInngest } from 'envelop-plugin-inngest'
import { createSchema, createYoga } from 'graphql-yoga'
import { Inngest } from 'inngest'

const inngestClient = new Inngest({ name: 'My App' })

// Provide your schema
const yoga = createYoga({
  schema: createSchema({
    typeDefs: /* GraphQL */ `
      type Message {
        body: String!
      }

      type Query {
        greetings: Message!
      }
    `,
    resolvers: {
      Query: {
        greetings: () => {
          body: 'Hello World!'
        }
      }
    }
  }),
  plugins: [
    useInngest({
      inngestClient,
      includeRawResult: true,
      redactRawResultOptions: { paths: ['*.body'] }
    })
  ]
})
```

Then the `body` will not show `Hello World!` but rather `[REDACTED]`.

For a complete set of `RedactOptions`, please see
[fast-redact](https://github.com/davidmarkclements/fast-redact).

### Redact Sensitive Information from Variables

You may also want to prevent certain mutation variables to be sent as part of the event payload to
redact sensitive info.

If your mutation updates a `User` email by id, you likely won't want to send their email.

```ts
mutation UpdateMyUser($id: ID!, $email: String!) {
  updateUser(id: $id, email: $email) {
    id
    email
  }
}
```

and the variables are:

```ts
{ id: 99, email: 'user@example.com' }
```

The you may redact their email by setting the

```ts
redactRawResultOptions: { paths: ['*.email'] } }
```

which will redact the email in the `variables` sent:

```ts
{
  name: 'graphql/update-my-user.mutation',
  data: {
    variables: { id: 99, email: '[REDACTED]' },
    identifiers: [{ id: '99', typename: 'User' }],
    types: ['User'],
    result: {},
    operation: { id: 'update-my-user', name: 'UpdateMyEmail', type: 'mutation' },
  },
  user: {},
}
```

## Additional Information

For more information about this plugin and Inngest, see the main [README](../../../README.md).
