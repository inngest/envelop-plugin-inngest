import { ExecutionResult, Plugin } from '@envelop/core';
import { defaultGetDocumentString, useCacheDocumentString } from './cache-document-str.js';
import {
  buildEventName,
  buildEventNamePrefix,
  buildEventPayload,
  buildUserContext,
} from './event-helpers.js';
import { buildLogger } from './logger.js';
import { shouldSendEvent } from './should-send-event.js';
import type { UseInngestPluginOptions } from './types.js';

export { OperationTypeNode as SendableOperation } from 'graphql';

export const USE_INNGEST_DEFAULT_EVENT_PREFIX = 'graphql';
export const USE_INNGEST_ANONYMOUS_EVENT_PREFIX = 'anonymous';

/**
 * Sends GraphQL operation events to Inngest
 *
 * @param options UseInngestPluginOptions
 */
export const useInngest = ({
  inngestClient,
  buildEventNameFunction = buildEventName,
  buildEventNamePrefixFunction = buildEventNamePrefix,
  buildUserContextFunction = buildUserContext,
  sendOperations = ['query', 'mutation'],
  sendAnonymousOperations = false,
  sendErrors = false,
  sendIntrospection = false,
  denylist,
  includeRawResult = false,
  redactRawResultOptions = undefined,
  logging = false,
}: UseInngestPluginOptions): Plugin => {
  // eslint-disable-next-line dot-notation
  const logger = inngestClient['logger'] || buildLogger({ logging });
  const getDocumentString = defaultGetDocumentString;

  return {
    onPluginInit({ addPlugin }) {
      addPlugin(useCacheDocumentString());
    },
    async onExecute(onExecuteParams) {
      return {
        async onExecuteDone({ result }) {
          try {
            const eventNamePrefix = await buildEventNamePrefixFunction({
              params: onExecuteParams,
              logger,
            });
            const eventName = await buildEventNameFunction({
              params: onExecuteParams,
              documentString: getDocumentString(onExecuteParams.args),
              eventNamePrefix,
              logger,
            });

            if (
              await shouldSendEvent({
                eventName,
                params: onExecuteParams,
                result: result as ExecutionResult,
                sendOperations,
                sendErrors,
                sendIntrospection,
                sendAnonymousOperations,
                denylist,
                logger,
              })
            ) {
              await inngestClient.send({
                name: eventName,
                data: await buildEventPayload({
                  eventName,
                  params: onExecuteParams,
                  result: result as ExecutionResult,
                  includeRawResult,
                  redactRawResultOptions,
                  logger,
                }),
                user: await buildUserContextFunction({ params: onExecuteParams, logger }),
              });
            }
          } catch (error) {
            logger.error(error, 'Error sending event to Inngest');
          }
        },
      };
    },
  };
};
