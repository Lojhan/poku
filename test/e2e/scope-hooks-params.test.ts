import { assert } from '../../src/modules/essentials/assert.js';
import { poku } from '../../src/modules/essentials/poku.js';
import { describe } from '../../src/modules/helpers/describe.js';
import { it } from '../../src/modules/helpers/it/core.js';

describe('Scope Hooks Params (e2e)', async () => {
  await it('injects plugin params into userland it/test callbacks via poku()', async () => {
    const code = await poku('./test/__fixtures__/e2e/scope-hooks-params', {
      noExit: true,
      quiet: true,
    });

    assert.strictEqual(
      code,
      0,
      'Scope hook params should be injected and fixture should pass'
    );
  });
});
