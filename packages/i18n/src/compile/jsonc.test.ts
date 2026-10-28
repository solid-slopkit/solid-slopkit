import { describe, expect, test } from 'vitest';
import { parseJsonc } from './jsonc';

describe('parseJsonc', () => {
  test('parses plain JSON', () => {
    expect(parseJsonc('{"a":{"b":"c"}}')).toEqual({ a: { b: 'c' } });
  });

  test('ignores line and block comments', () => {
    expect(parseJsonc('{\n // note\n "a": "x", /* inline */ "b": "y" /* tail */\n}')).toEqual({ a: 'x', b: 'y' });
  });

  test('keeps comment markers and commas inside strings', () => {
    expect(parseJsonc('{"url":"http://x // y","c":"a, } b /* z */"}')).toEqual({ url: 'http://x // y', c: 'a, } b /* z */' });
  });

  test('handles escaped quotes in strings', () => {
    expect(parseJsonc('{"q":"say \\"hi\\" // not a comment"}')).toEqual({ q: 'say "hi" // not a comment' });
  });

  test('allows trailing commas, also before comments', () => {
    expect(parseJsonc('{"a":["x","y",], "b":"z", // last\n}')).toEqual({ a: ['x', 'y'], b: 'z' });
  });

  test('throws on invalid JSON', () => {
    expect(() => parseJsonc('{"a": }')).toThrow();
  });
});
