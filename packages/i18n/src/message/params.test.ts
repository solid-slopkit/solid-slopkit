import { describe, expect, test } from 'vitest';
import { handles, inferParams, renderParamType } from './params';
import { parseMessage } from './parse';

const params = (text: string) =>
  Object.fromEntries([...inferParams(parseMessage(text))].map(([name, kind]) => [name, renderParamType(kind)]));

describe('inferParams', () => {
  test('a message without arguments has none', () => {
    expect(inferParams(parseMessage('Hello'))).toEqual(new Map());
  });

  test('each argument kind has its type', () => {
    expect(params('{a} {b, number} {c, date} {d, plural, other {x}} {e, select, x {1} y {2} other {3}}')).toEqual({
      a: 'string | number',
      b: 'number',
      c: 'Date | number',
      d: 'number',
      e: '"x" | "y" | (string & {})',
    });
  });

  test('a select with only other takes a string', () => {
    expect(params('{x, select, other {y}}')).toEqual({ x: 'string' });
  });

  test('arguments inside branches are found', () => {
    expect(params('{n, plural, one {{who} has #} other {{who} have {m, number}}}')).toEqual({
      n: 'number',
      who: 'string | number',
      m: 'number',
    });
  });

  test('a repeated argument takes the narrower type', () => {
    expect(params('{n} of {n, number}')).toEqual({ n: 'number' });
    expect(params('{n} {n, plural, other {x}}')).toEqual({ n: 'number' });
    expect(params('{x} {x, select, a {1} other {2}}')).toEqual({ x: '"a" | (string & {})' });
    expect(params('{x, select, a {1} other {2}} {x, select, b {1} other {2}}')).toEqual({ x: '"a" | "b" | (string & {})' });
  });

  test('incompatible uses of one name throw', () => {
    expect(() => inferParams(parseMessage('{d} {d, date}'))).toThrow(/"d" is used as both plain text and a date/);
    expect(() => inferParams(parseMessage('{n, number} {n, date}'))).toThrow(/both a number and a date/);
    expect(() => inferParams(parseMessage('{x, select, a {1} other {2}} {x, number}'))).toThrow(/"x" is used as both/);
  });
});

describe('handles', () => {
  const kind = (text: string, name: string) => inferParams(parseMessage(text)).get(name)!;

  test('another locale may widen a number to plain text, but not narrow plain text', () => {
    expect(handles(kind('{n}', 'n'), kind('{n, number}', 'n'))).toBe(true);
    expect(handles(kind('{n, number}', 'n'), kind('{n}', 'n'))).toBe(false);
  });

  test('a date needs a date, a select takes plain text or any select', () => {
    expect(handles(kind('{d}', 'd'), kind('{d, date}', 'd'))).toBe(false);
    expect(handles(kind('{d, date}', 'd'), kind('{d, date}', 'd'))).toBe(true);
    expect(handles(kind('{x}', 'x'), kind('{x, select, a {1} other {2}}', 'x'))).toBe(true);
    expect(handles(kind('{x, select, b {1} other {2}}', 'x'), kind('{x, select, a {1} other {2}}', 'x'))).toBe(true);
    expect(handles(kind('{x, number}', 'x'), kind('{x, select, a {1} other {2}}', 'x'))).toBe(false);
  });
});
