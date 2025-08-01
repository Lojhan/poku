import { describe } from '../../../src/modules/helpers/describe.js';
import { it } from '../../../src/modules/helpers/it/core.js';

describe('Strict Suite (No Message)', async () => {
  const { strict: assert } = await import(
    '../../../src/modules/essentials/strict.js'
  );

  it(() => {
    assert(true);
    assert(1);
    assert('string');
    assert([]);
    assert({});
    assert(() => {});
    assert(3 > 2);
  });

  it(() => {
    assert.ok(true);
    assert.ok(1);
    assert.ok('string');
    assert.ok([]);
    assert.ok({});
    assert.ok(() => {});
    assert.ok(3 > 2);
  });

  it(() => {
    assert.equal(1, 1);
    assert.equal('text', 'text');
    assert.equal(2 + 2, 4);
    assert.equal('Hello'.toUpperCase(), 'HELLO');
  });

  it(() => {
    assert.deepEqual({ a: 1 }, { a: 1 });
    assert.deepEqual([1, 2], [1, 2]);
    assert.deepEqual([2, 3, 4], [2, 3, 4]);
    assert.deepEqual([1, 2, 3].reverse(), [3, 2, 1]);
  });

  it(() => {
    assert.strictEqual(1, 1);
    assert.strictEqual('text', 'text');
    assert.strictEqual(2 * 2, 4);
  });

  it(() => {
    assert.deepStrictEqual({ a: 1 }, { a: 1 });
    assert.deepStrictEqual([1, 2], [1, 2]);
    assert.deepStrictEqual({ a: 1, b: 2 }, { a: 1, b: 2 });
  });

  it(() => {
    assert.doesNotThrow(() => 1 + 1);
  });

  it(() => {
    assert.notEqual(1, 2);
    assert.notEqual(2 + 2, 5);
    assert.notEqual('Hello'.toLowerCase(), 'HELLO');
  });

  it(() => {
    assert.notStrictEqual(1, true);
    assert.notStrictEqual(1, '1');
    assert.notStrictEqual(2 * 2, '4');
    assert.notStrictEqual(2, '2');
  });

  it(() => {
    assert.notDeepEqual({ a: 1 }, { a: 2 });
    assert.notDeepEqual([2, 3, 4], [4, 5, 6]);
  });

  it(() => {
    assert.notDeepStrictEqual({ a: 1 }, { a: '1' });
    assert.notDeepStrictEqual([1, 2, 3], [1, 2, '3']);
    assert.notDeepStrictEqual({ a: 1 }, { a: '1' });
  });

  const callbackFunction = (
    cb: (err: Error | null, result?: string) => void
  ) => {
    cb(null, 'no error');
  };

  it(() => {
    assert.ifError(null);
    assert.ifError(undefined);
  });

  it(() => {
    const obj = { a: 1 };

    const functionThatThrows = () => {
      throw new Error('Specific error');
    };

    it(() => {
      assert.throws(() => {
        throw new Error('error');
      });
      assert.throws(() => {
        throw new Error('Test error');
      });
      assert.throws(() => {
        throw new Error('Test error');
      });
      assert.throws(functionThatThrows, new Error('Specific error'));
      assert.throws(functionThatThrows, /Specific error/);
      assert.throws(
        functionThatThrows,
        (err) => err instanceof Error && err.message === 'Specific error'
      );
    });

    it(() => {
      assert.doesNotThrow(() => {
        obj.a = 2;
      });
      assert.strictEqual(obj.a, 2);
      assert.doesNotThrow(() => {
        return 42;
      });
      assert.doesNotThrow(() =>
        callbackFunction((err) => {
          assert.ifError(err);
        })
      );
      assert.doesNotThrow(() => 42);
      assert.doesNotThrow(() => 'no error');
    });
  });

  it(() => {
    const text = 'sample text';

    it(() => {
      assert.match(text, /sample/);
    });

    it(() => {
      assert.doesNotMatch(text, /notpresent/);
      assert.doesNotMatch('abc', /123/);
      assert.doesNotMatch('', /\d/);
      assert.doesNotMatch('abc', /\d+/);
    });
  });

  it(() => {
    const asyncFunctionThatRejects = async () =>
      await Promise.reject(new Error('Async error'));

    const asyncFunctionThatResolves = () =>
      Promise.resolve('Resolved successfully');

    const asyncFunctionThatFails = () =>
      new Promise((_, reject) => reject(new Error('Failed')));

    const asyncFunctionThatCouldReject = () =>
      new Promise((resolve) => resolve(undefined));

    it(() => {
      assert.rejects(
        async () => await asyncFunctionThatFails(),
        new Error('Failed')
      );
      assert.rejects(asyncFunctionThatRejects, new Error('Async error'));
      assert.rejects(
        () => Promise.reject('Simple rejection'),
        (err) => err === 'Simple rejection'
      );
      assert.rejects(asyncFunctionThatRejects, new Error('Async error'));
    });

    it(() => {
      assert.doesNotReject(asyncFunctionThatResolves);
      assert.doesNotReject(Promise.resolve('Immediate resolve'));
      assert.doesNotReject(asyncFunctionThatCouldReject);
      assert.doesNotReject(() =>
        Promise.resolve('Async function with no rejection')
      );
      assert.doesNotReject(asyncFunctionThatResolves);
    });
  });
});
