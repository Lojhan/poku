import { AsyncLocalStorage } from 'node:async_hooks';
import { GLOBAL } from '../../src/configs/poku.js';
import { assert } from '../../src/modules/essentials/assert.js';
import { describe } from '../../src/modules/helpers/describe.js';
import { afterEach } from '../../src/modules/helpers/each.ts';
import { it, itBase } from '../../src/modules/helpers/it/core.js';

const SCOPE_HOOKS_KEY = Symbol.for('@pokujs/poku.test-scope-hooks');

type ScopeHooks = {
  createHolder: () => { scope: unknown };
  runScoped: (
    holder: { scope: unknown },
    fn: (params?: Record<string, unknown>) => Promise<void> | void
  ) => Promise<void>;
};

type GlobalWithScopeHooks = typeof globalThis &
  Record<symbol, ScopeHooks | undefined>;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

GLOBAL.configs.noExit = true;
GLOBAL.configs.quiet = true;

const g = globalThis as GlobalWithScopeHooks;
const originalHooks = g[SCOPE_HOOKS_KEY];

const overrideHooks = (hooks: ScopeHooks) => {
  g[SCOPE_HOOKS_KEY] = hooks;
};

describe('itBase generic scope hooks', async () => {
  afterEach(() => {
    g[SCOPE_HOOKS_KEY] = originalHooks;
  });

  await it('falls back to default execution when no hooks are registered', async () => {
    delete g[SCOPE_HOOKS_KEY];

    let executed = false;
    await itBase(() => {
      executed = true;
    });

    assert.strictEqual(executed, true, 'itBase callback runs without hooks');
  });

  await it('isolates scoped stores across concurrent itBase runs', async () => {
    const als = new AsyncLocalStorage<{ id: number }>();
    let idSeed = 0;

    const hooks: ScopeHooks = {
      createHolder: () => ({ scope: undefined }),
      runScoped: async (holder, fn) => {
        const id = ++idSeed;
        holder.scope = { id };
        await als.run({ id }, async () => {
          const result = fn();
          if (result instanceof Promise) await result;
        });
      },
    };

    overrideHooks(hooks);

    const seenIds = new Map<string, number>();
    let inFlight = 0;
    let maxInFlight = 0;

    const runCase = async (label: string) => {
      await itBase(async () => {
        const storeBefore = als.getStore();
        if (!storeBefore) {
          assert.fail(`${label}: store exists before await`);
          return;
        }

        seenIds.set(label, storeBefore.id);

        inFlight++;
        if (inFlight > maxInFlight) maxInFlight = inFlight;

        await sleep(40);

        const storeAfter = als.getStore();
        if (!storeAfter) {
          assert.fail(`${label}: store exists after await`);
          return;
        }

        assert.strictEqual(
          storeAfter.id,
          storeBefore.id,
          `${label}: store id is stable through async hops`
        );

        inFlight--;
      });
    };

    await Promise.all([runCase('A'), runCase('B')]);

    const idA = seenIds.get('A');
    const idB = seenIds.get('B');

    assert.ok(typeof idA === 'number', 'A receives a scoped id');
    assert.ok(typeof idB === 'number', 'B receives a scoped id');
    assert.notStrictEqual(idA, idB, 'concurrent runs receive different stores');
    assert.ok(maxInFlight >= 2, 'callbacks overlapped and ran concurrently');
  });

  await it('passes scope params into test callback', async () => {
    const hooks: ScopeHooks = {
      createHolder: () => ({ scope: undefined }),
      runScoped: async (_holder, fn) => {
        const result = fn({ value: 'from-scope-hooks' });
        if (result instanceof Promise) await result;
      },
    };

    overrideHooks(hooks);

    await itBase((params) => {
      const value = (params as { value: string }).value;
      assert.strictEqual(
        value,
        'from-scope-hooks',
        'context value is forwarded to callback'
      );
    });
  });
});
