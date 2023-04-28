import type { SetupFunctionTasksOptions } from '../src/function//types';
import { renderFunctionTemplate } from '../src/function/helpers';

describe('Render function templates', () => {
  describe('standard inngest events', () => {
    it('renders a background function', () => {
      const options: SetupFunctionTasksOptions = {
        name: 'OrderCreated',
        type: 'background',
        eventName: 'OrderCreated',
        graphql: false,
        force: false,
        cwd: __dirname,
      };

      const { rendered } = renderFunctionTemplate(options);

      expect(rendered).toMatchSnapshot();
    });

    it('renders a delayed function', () => {
      const options: SetupFunctionTasksOptions = {
        name: 'AfterCheckout',
        type: 'delayed',
        eventName: 'AfterCheckout',
        graphql: false,
        force: false,
        cwd: __dirname,
      };

      const { rendered } = renderFunctionTemplate(options);

      expect(rendered).toMatchSnapshot();
    });

    it('renders a scheduled function', () => {
      const options: SetupFunctionTasksOptions = {
        name: 'test',
        type: 'scheduled',
        eventName: 'cronJob',
        graphql: false,
        force: false,
        cwd: __dirname,
      };

      const { rendered } = renderFunctionTemplate(options);

      expect(rendered).toMatchSnapshot();
    });

    it('renders a step function', () => {
      const options: SetupFunctionTasksOptions = {
        name: 'OnboardUser',
        type: 'step',
        eventName: 'UserSignUp',
        graphql: false,
        force: false,
        cwd: __dirname,
      };

      const { rendered } = renderFunctionTemplate(options);

      expect(rendered).toMatchSnapshot();
    });

    it('renders a fan-out function', () => {
      const options: SetupFunctionTasksOptions = {
        name: 'SendNewsletter',
        type: 'fan-out',
        eventName: 'RegisterUser',
        graphql: false,
        force: false,
        cwd: __dirname,
      };

      const { rendered } = renderFunctionTemplate(options);

      expect(rendered).toMatchSnapshot();
    });
  });

  describe('graphql triggered events', () => {
    describe('by queries', () => {
      it('renders a background function', () => {
        const options: SetupFunctionTasksOptions = {
          name: 'GetPosts',
          type: 'background',
          eventName: 'FindPosts',
          graphql: true,
          operationType: 'query',
          force: false,
          cwd: __dirname,
        };

        const { rendered } = renderFunctionTemplate(options);

        expect(rendered).toMatchSnapshot();
      });

      it('renders a background function', () => {
        const options: SetupFunctionTasksOptions = {
          name: 'GetPosts',
          type: 'background',
          eventName: 'FindPosts',
          graphql: true,
          operationType: 'query',
          force: false,
          cwd: __dirname,
        };

        const { rendered } = renderFunctionTemplate(options);

        expect(rendered).toMatchSnapshot();
      });

      it('renders a delayed function', () => {
        const options: SetupFunctionTasksOptions = {
          name: 'GetPostBySlug',
          type: 'delayed',
          eventName: 'GetPostBySlug',
          graphql: true,
          operationType: 'query',
          force: false,
          cwd: __dirname,
        };

        const { rendered } = renderFunctionTemplate(options);

        expect(rendered).toMatchSnapshot();
      });

      it('renders a scheduled function', () => {
        const options: SetupFunctionTasksOptions = {
          name: 'GetAllPosts',
          type: 'scheduled',
          eventName: 'FindAllPosts',
          graphql: true,
          operationType: 'query',
          force: false,
          cwd: __dirname,
        };

        const { rendered } = renderFunctionTemplate(options);

        expect(rendered).toMatchSnapshot();
      });

      it('renders a step function', () => {
        const options: SetupFunctionTasksOptions = {
          name: 'GetPost',
          type: 'step',
          eventName: 'FindPostById',
          graphql: true,
          operationType: 'query',
          force: false,
          cwd: __dirname,
        };

        const { rendered } = renderFunctionTemplate(options);

        expect(rendered).toMatchSnapshot();
      });
    });

    describe('by mutations', () => {
      it('renders a background function', () => {
        const options: SetupFunctionTasksOptions = {
          name: 'OnPostUpdate',
          type: 'background',
          eventName: 'UpdatePostById',
          graphql: true,
          operationType: 'mutation',
          force: false,
          cwd: __dirname,
        };

        const { rendered } = renderFunctionTemplate(options);

        expect(rendered).toMatchSnapshot();
      });

      it('renders a delayed function', () => {
        const options: SetupFunctionTasksOptions = {
          name: 'OnPostDelete',
          type: 'delayed',
          eventName: 'DeletePostById',
          graphql: true,
          operationType: 'mutation',
          force: false,
          cwd: __dirname,
        };

        const { rendered } = renderFunctionTemplate(options);

        expect(rendered).toMatchSnapshot();
      });

      it('renders a step function', () => {
        const options: SetupFunctionTasksOptions = {
          name: 'OnPostEdit',
          type: 'step',
          eventName: 'EditPostById',
          graphql: true,
          operationType: 'mutation',
          force: false,
          cwd: __dirname,
        };

        const { rendered } = renderFunctionTemplate(options);

        expect(rendered).toMatchSnapshot();
      });

      it('renders a fan-out function', () => {
        const options: SetupFunctionTasksOptions = {
          name: 'WhenNewPost',
          type: 'fan-out',
          eventName: 'AddPost',
          graphql: true,
          operationType: 'mutation',
          force: false,
          cwd: __dirname,
        };

        const { rendered } = renderFunctionTemplate(options);

        expect(rendered).toMatchSnapshot();
      });
    });
  });
});
