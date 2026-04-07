import { composeScopeHooks } from '../../../../../src/modules/plugins.js';

export const registerAlphaPlugin = () => {
  composeScopeHooks({
    name: '@fixture/alpha-scope-plugin',
    createHolder: () => ({ scope: undefined }),
    runScoped: async (_holder, fn) => {
      const result = fn({ alpha: 'A' });
      if (result instanceof Promise) await result;
    },
  });
};
