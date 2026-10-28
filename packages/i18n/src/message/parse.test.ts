import { describe, expect, test } from 'vitest';
import { MessageSyntaxError } from './ast';
import { parseMessage } from './parse';

const fails = (text: string, pattern: RegExp) => {
  expect(() => parseMessage(text)).toThrow(MessageSyntaxError);
  expect(() => parseMessage(text)).toThrow(pattern);
};

describe('parseMessage', () => {
  test('plain text is one literal, and the empty message has no parts', () => {
    expect(parseMessage('Hello, world')).toEqual(['Hello, world']);
    expect(parseMessage('')).toEqual([]);
  });

  test('arguments, with whitespace allowed inside the braces', () => {
    expect(parseMessage('Hi {name}, you have {  count  }!')).toEqual([
      'Hi ',
      { t: 'arg', n: 'name' },
      ', you have ',
      { t: 'arg', n: 'count' },
      '!',
    ]);
  });

  test('number and date, with and without a style', () => {
    expect(parseMessage('{a, number}{b, number, percent}{c, number, integer}')).toEqual([
      { t: 'num', n: 'a' },
      { t: 'num', n: 'b', s: 'percent' },
      { t: 'num', n: 'c', s: 'integer' },
    ]);
    expect(parseMessage('{d, date}{e, date, long}')).toEqual([
      { t: 'date', n: 'd' },
      { t: 'date', n: 'e', s: 'long' },
    ]);
  });

  test('plural with exact matches, categories and #', () => {
    expect(parseMessage('{n, plural, =0 {none} one {# item} other {# items}}')).toEqual([
      {
        t: 'plural',
        n: 'n',
        o: [
          ['=0', ['none']],
          ['one', [{ t: 'pound' }, ' item']],
          ['other', [{ t: 'pound' }, ' items']],
        ],
      },
    ]);
  });

  test('select, with branches that hold arguments', () => {
    expect(parseMessage('{role, select, admin {Hi {name}} other {Hello}}')).toEqual([
      {
        t: 'select',
        n: 'role',
        o: [
          ['admin', ['Hi ', { t: 'arg', n: 'name' }]],
          ['other', ['Hello']],
        ],
      },
    ]);
  });

  test('# in a select inside a plural still means the plural number; elsewhere it is text', () => {
    expect(parseMessage('# {n, plural, other {{g, select, other {#}}}}')).toEqual([
      '# ',
      { t: 'plural', n: 'n', o: [['other', [{ t: 'select', n: 'g', o: [['other', [{ t: 'pound' }]]] }]]] },
    ]);
  });

  test('nested plurals', () => {
    const [part] = parseMessage('{a, plural, other {{b, plural, one {x} other {y}}}}');
    expect(part).toMatchObject({ t: 'plural', n: 'a' });
  });

  describe('apostrophes', () => {
    test("'' is an apostrophe, a lone ' is itself", () => {
      expect(parseMessage("it''s")).toEqual(["it's"]);
      expect(parseMessage("don't")).toEqual(["don't"]);
    });

    test('quoted braces are literal', () => {
      expect(parseMessage("Use '{'name'}' here")).toEqual(['Use {name} here']);
      expect(parseMessage("'{x}'")).toEqual(['{x}']);
      expect(parseMessage("'{it''s}' {n}")).toEqual(["{it's} ", { t: 'arg', n: 'n' }]);
    });
  });

  describe('errors name the problem and the position', () => {
    test('unbalanced and unterminated', () => {
      fails('a } b', /unmatched "}" .* \(at character 3\)/);
      fails('{name', /expected "," or "}"/);
      fails("'{ oops", /unterminated quote/);
      fails('{n, plural, other {x', /not closed/);
    });

    test('unknown types and styles', () => {
      fails('{n, ordinal, other {x}}', /unknown argument type "ordinal"/);
      fails('{n, number, currency}', /unknown number style "currency"/);
      fails('{d, date, tiny}', /unknown date style "tiny"/);
    });

    test('every plural and select needs an other branch', () => {
      fails('{n, plural, one {x}}', /a plural needs an "other" branch/);
      fails('{x, select, a {y}}', /a select needs an "other" branch/);
    });

    test('plural selectors', () => {
      fails('{n, plural, few2 {x} other {y}}', /unknown plural category "few2"/);
      fails('{n, plural, =a {x} other {y}}', /not an exact match/);
      fails('{n, plural, offset:1 other {x}}', /offset is not supported/);
    });

    test('duplicate branches and a missing name', () => {
      fails('{n, plural, one {a} one {b} other {c}}', /duplicate branch "one"/);
      fails('{}', /expected an argument name/);
    });
  });
});
