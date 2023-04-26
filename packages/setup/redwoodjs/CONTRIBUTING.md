# Contributing

## How To Build

`yarn build`

## How To Run a Development Script

From your RedwoodJS project, run the script:

```
node ../../inngest/envelop-plugin-inngest/packages/setup/redwoodjs/dist/cjs/index.js
```

Note: Assumes project paths. Adjust for the relative directory for you command.

## How to Run Tests

### Test All Plugins and Commands

`yarn test`

### Test Setup Command Codemod Only

`yarn test packages/setup/redwoodjs/tests/use-inngest-codemod.test.ts`

## Before Submitting PR

1. Build via `yarn build`
2. Run full test suite via `yarn test`
3. Run type check via `yarn ts:check`
4. Test ESM & CJS exports integrity via `yarn bob check`
5. Create a
   [changeset](https://github.com/changesets/changesets/blob/main/docs/adding-a-changeset.md) via
   `yarn changeset`

Note: bob the bundler integrity checks are skipped for the setup command as the handler script
cannot run outside a Redwood project

## All

```terminal
yarn build && yarn lint && yarn test && yarn ts:check && yarn bob check
```
