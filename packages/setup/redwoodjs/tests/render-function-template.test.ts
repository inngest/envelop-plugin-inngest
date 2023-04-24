import type { SetupFunctionTasksOptions } from '../src/function//types';
import { renderFunctionTemplate } from '../src/function/helpers';

describe('Render function templates', () => {
  describe('standard events', () => {
    it('render a scheduled function', () => {
      const options: SetupFunctionTasksOptions = {
        name: 'test',
        type: 'scheduled',
        eventName: 'testEventName',
        graphql: false,
        //   operationType: 'mutation',
        force: false,
        cwd: __dirname,
      };

      const { rendered } = renderFunctionTemplate(options);

      expect(rendered).toMatchSnapshot();
    });
  });
});
