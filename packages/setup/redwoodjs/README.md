# inngest-setup-redwoodjs

Command for setting up Inngest background jobs and events support in a RedwoodJS project

## Usage

```
yarn dlx inngest-setup-redwoodjs
node ../../inngest/envelop-plugin-inngest/packages/setup/redwoodjs/dist/cjs/index.js
```

Run the command above inside your RW project and it'll install and create the Inngest client in your RedwoodJS project.

### Run the Inngest dev server

```
 npx inngest-cli@latest dev
```

### Navigate to the Inngest dev server

```
http://127.0.0.1:8288/
```

### Sending Events to Inngest

To quickly test out your event from the dev server click the "Send Event" button in top right and add you event data.

```
{
  "name": "test/hello.world",
  "data": {
    "name": "Redwood"
  },
}
```

To send an event from a redwood service you can import the inngest client and call the send method with your event data

```
import { inngest } from 'src/inngest/client'

await inngest.send({
  // The event name
  name: "test/hello.world",
  // The event's data
  data: {
    name: 'Redwood',
  }
```

## Note

Currently this only works for TS projects. (Also see below 😉)

## Contributing

If you want to add JS support, or contribute any other changes an easy way to test this locally is:

```
yarn start --cwd ../rw-example-project --force
```

### Releasing

It's made to be released by npm (e.g. `npm run release:patch`). That way I don't have to worry about yarn v1 vs v3
