import { results } from '../configs/results.js';
import { format } from '../services/format.js';

const SKIP_MARKER = '\x1b[94m\x1b[1m◯';
const TODO_MARKER = '\x1b[96m\x1b[1m●';
const ANSI_RESET = '\x1b[0m';

export const timeoutMessage = (ms: number): string =>
  `${format(`● Timeout: test file exceeded ${ms}ms limit`).fail().bold()}`;

export const serialize = (
  value: unknown,
  seen: WeakSet<object> = new WeakSet()
): unknown => {
  if (
    typeof value === 'undefined' ||
    typeof value === 'function' ||
    typeof value === 'bigint' ||
    typeof value === 'symbol' ||
    value instanceof RegExp
  )
    return String(value);

  if (value !== null && typeof value === 'object') {
    if (
      typeof (value as { nodeType?: unknown }).nodeType === 'number' &&
      typeof (value as { nodeName?: unknown }).nodeName === 'string'
    ) {
      const outerHTML = (value as { outerHTML?: unknown }).outerHTML;
      if (typeof outerHTML === 'string') return outerHTML;
      return `[DOMNode ${(value as { nodeName: string }).nodeName}]`;
    }

    if (seen.has(value)) return '[Circular]';
    seen.add(value);

    try {
      if (Array.isArray(value))
        return value.map((item) => serialize(item, seen));
      if (value instanceof Set)
        return Array.from(value, (item) => serialize(item, seen));
      if (value instanceof Map)
        return Object.fromEntries(
          Array.from(value.entries(), ([key, val]) => [
            String(serialize(key, seen)),
            serialize(val, seen),
          ])
        );

      return Object.fromEntries(
        Object.entries(value).map(([key, val]) => [key, serialize(val, seen)])
      );
    } finally {
      seen.delete(value);
    }
  }

  return value;
};

export const parserOutput = (options: {
  output: string;
  result: boolean;
  debug?: boolean;
}) => {
  const { output, result, debug } = options;

  const pad = '  ';
  const isDebugOrFailed = debug || !result;
  const outputs: string[] = [];

  let offset = 0;

  while (offset < output.length) {
    const nextNewline = output.indexOf('\n', offset);
    const lineEnd = nextNewline === -1 ? output.length : nextNewline;

    if (lineEnd > offset) {
      const line = output.substring(offset, lineEnd);

      if (line.includes(SKIP_MARKER)) results.skipped++;
      if (line.includes(TODO_MARKER)) results.todo++;

      if (line.trim().length > 0) {
        if (
          isDebugOrFailed ||
          (line.indexOf('Exited with code') === -1 && line.includes(ANSI_RESET))
        ) {
          outputs.push(`${pad}${line}`);
        }
      }
    }

    offset = lineEnd + 1;
  }

  if (outputs.length === 0) return;

  return outputs;
};
