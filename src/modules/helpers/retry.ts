import type { RetryConfig, RetryContext } from '../../@types/retry.js';
import { GLOBAL } from '../../configs/poku.js';
import { retryContext } from '../../configs/retry.js';

export async function retry(
  config: number | RetryConfig,
  callback: () => unknown | Promise<unknown>
): Promise<void> {
  const attempts = typeof config === 'number' ? config : config.attempts;
  const delay = typeof config === 'number' ? 0 : (config.delay ?? 0);

  for (let attempt = 1; attempt <= attempts; attempt++) {
    const context: RetryContext = {
      attempts,
      currentAttempt: attempt,
      delay,
      failed: false,
    };

    GLOBAL.reporter.onRetryStart?.({ attempt, total: attempts });

    await retryContext.run(context, async () => {
      try {
        await callback();
      } catch {
        context.failed = true;
      }
    });

    if (!context.failed) {
      GLOBAL.reporter.onRetryEnd?.({
        attempt,
        total: attempts,
        success: true,
      });
      return;
    }

    GLOBAL.reporter.onRetryEnd?.({ attempt, total: attempts, success: false });

    if (attempt < attempts && delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  const parent = retryContext.stack?.[retryContext.stack.length - 1];
  if (parent) parent.failed = true;
  else process.exitCode = 1;
}
