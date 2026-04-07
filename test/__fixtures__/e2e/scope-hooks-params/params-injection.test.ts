import { assert } from '../../../../src/modules/essentials/assert.js';
import { describe } from '../../../../src/modules/helpers/describe.js';
import { it } from '../../../../src/modules/helpers/it/core.js';
import { test } from '../../../../src/modules/helpers/test.js';
import { registerAlphaPlugin } from './plugins/alpha.plugin.ts';
import { registerBetaPlugin } from './plugins/beta.plugin.ts';

registerAlphaPlugin();
registerBetaPlugin();

describe('scope hooks fixture', () => {
  it('injects params into it callback', ({ alpha, beta }) => {
    assert.strictEqual(alpha, 'A', 'alpha param is injected');
    assert.strictEqual(beta, 2, 'beta param is injected');
  });

  test('injects params into test callback', ({ alpha, beta }) => {
    assert.strictEqual(alpha, 'A', 'alpha param reaches test alias');
    assert.strictEqual(beta, 2, 'beta param reaches test alias');
  });
});
