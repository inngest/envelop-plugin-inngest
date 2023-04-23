import { inngest } from 'src/lib/inngest'

const helloWorld = inngest.createFunction(
  { name: 'Hello World' },
  { event: 'test/hello-world' },
  async ({ event, step }) => {
    await step.sleep('1s')

    return {
      event,
      body: `Hello, ${event.data?.name ? event.data.name : 'World'}!`,
    }
  }
)

export default helloWorld
