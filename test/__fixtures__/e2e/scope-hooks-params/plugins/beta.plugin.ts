import { composeScopeHooks } from '../../../../../src/modules/plugins.js';

export const registerBetaPlugin = () => {
  composeScopeHooks({
    name: '@fixture/beta-scope-plugin',
    createHolder: () => ({ scope: undefined }),
    runScoped: async (_holder, fn) => {
      const result = fn({ beta: 2 });
      if (result instanceof Promise) await result;
    },
  });
};
