import type { SetupFunctionTasksOptions } from '../src/function//types';
import { getNamesForFile } from '../src/function/helpers';

describe('event name', () => {
  describe('standard events', () => {
    it('should handle a scheduled function type', () => {
      const options: SetupFunctionTasksOptions = {
        name: 'test',
        type: 'scheduled',
        eventName: 'testEventName',
        graphql: false,
        //   operationType: 'mutation',
        force: false,
        cwd: __dirname,
      };

      const { eventName } = getNamesForFile(options);

      expect(eventName).toEqual('event/test');
    });

    it('should handle a delayed function type', () => {
      const options: SetupFunctionTasksOptions = {
        name: 'FindMyCar',
        type: 'delayed',
        eventName: 'testEventName',
        graphql: false,
        //   operationType: 'mutation',
        force: false,
        cwd: __dirname,
      };

      const { eventName } = getNamesForFile(options);

      expect(eventName).toEqual('event/find-my-car');
    });

    it('should handle uppercase event names', () => {
      // Issue: https://github.com/inngest/envelop-plugin-inngest/issues/66
      const options: SetupFunctionTasksOptions = {
        name: 'FindMultiEvent',
        type: 'delayed',
        eventName: 'FIND_MULTI_VIEW_EVENT_BY_CODE',
        graphql: true,
        operationType: 'query',
        force: false,
        cwd: __dirname,
      };

      const { eventName } = getNamesForFile(options);

      expect(eventName).toEqual('graphql/find-multi-view-event-by-code.query');
    });
  });

  describe('graphql events', () => {
    it('should handle a query', () => {
      const options: SetupFunctionTasksOptions = {
        name: 'test',
        type: 'background',
        eventName: 'testEventName',
        graphql: true,
        operationType: 'query',
        force: false,
        cwd: __dirname,
      };

      const { eventName } = getNamesForFile(options);

      expect(eventName).toEqual('graphql/test-event-name.query');
    });
    it('should handle a mutation', () => {
      const options: SetupFunctionTasksOptions = {
        name: 'test',
        type: 'background',
        eventName: 'testEventName',
        graphql: true,
        operationType: 'mutation',
        force: false,
        cwd: __dirname,
      };

      const { eventName } = getNamesForFile(options);

      expect(eventName).toEqual('graphql/test-event-name.mutation');
    });

    it('should not allow graphql for scheduled function type', () => {
      const options: SetupFunctionTasksOptions = {
        name: 'test',
        type: 'scheduled',
        eventName: 'testEventName',
        graphql: true,
        operationType: 'mutation',
        force: false,
        cwd: __dirname,
      };

      const { eventName } = getNamesForFile(options);

      expect(eventName).toEqual('event/test');
    });
  });
});
