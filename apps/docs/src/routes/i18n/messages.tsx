import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { DocTable } from '../../components/DocTable';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';

import Messages from '../../examples/i18n/messages';
import messagesCode from '../../examples/i18n/messages.tsx?raw';
import messagesFile from '../../examples/i18n/messages.i18n.jsonc?raw';

const SYNTAX: [string, string, string][] = [
  ['{name}', 'string | number', "The value, as it is: a number isn't formatted."],
  ['{n, number}', 'number', 'Formatted for the locale: 1,234.5 in English, 1.234,5 in German. Styles: integer, percent.'],
  [
    '{d, date}',
    'Date | number',
    'Formatted for the locale. Styles: short, medium (default), long, full. A number is a timestamp.',
  ],
  [
    '{n, plural, one {…} other {…}}',
    'number',
    "The branch for the locale's plural category: zero, one, two, few, many, other. =0 matches exactly, and # is the number.",
  ],
  [
    '{x, select, a {…} b {…} other {…}}',
    'string',
    'The branch named x, else other. The listed names are suggested, and any string is accepted.',
  ],
];

export default function I18nMessages() {
  return (
    <article class="docs-page">
      <Title>Messages · i18n · slopkit</Title>
      <p class="docs-eyebrow">i18n</p>
      <h1>Messages</h1>
      <p class="docs-lead">
        What a message can contain: arguments, plurals, select, numbers and dates, parsed at build time and typed.
      </p>
      <p>
        A message is a string. Most are plain text, and then <code>translations.title</code> is just that string. A message with
        arguments becomes a function of one object, and its type comes from the message: the build reads every message of every
        locale.
      </p>
      <DocTable
        head={['In a message', 'Argument type', 'Result']}
        rows={SYNTAX.map(([syntax, type, result]) => [<code>{syntax}</code>, <code>{type}</code>, result])}
      />
      <p>
        Branches can contain arguments and further plurals or selects. In a plural, <code>#</code> is the number, also inside a
        select within it. To write a literal brace, quote it with apostrophes (<code>{`'{'`}</code>); <code>{`''`}</code> is an
        apostrophe.
      </p>

      <H2 id="in-use">In use</H2>
      <p>
        Plurals use the locale's own rules, which is why the Ukrainian text has four branches. The number, date and plural
        formatting come from <code>Intl</code>, so nothing is added to your bundle.
      </p>
      <CodeBlock lang="jsonc" code={messagesFile} />
      <Example component={Messages} code={messagesCode} column />

      <H2 id="checks">What the build checks</H2>
      <ul>
        <li>
          A message that doesn't parse, or a plural or select without an <code>other</code> branch, fails the build.
        </li>
        <li>
          One name used two incompatible ways in a message (<code>{`{d} {d, date}`}</code>) is an error.
        </li>
        <li>
          A translation may use fewer arguments than the default locale's message, or a wider type for one (plain{' '}
          <code>{`{n}`}</code> where the default has <code>{`{n, number}`}</code>). It may not use an argument the default doesn't
          pass, nor need a narrower type than the default promises.
        </li>
      </ul>

      <H2 id="notes">Notes</H2>
      <ul>
        <li>
          An argument the caller didn't pass is left visible as <code>{`{name}`}</code> instead of throwing, so a missing value
          never breaks the page.
        </li>
        <li>
          Plural offsets, ordinals, currency styles and tags (rich text inside a message) aren't supported. Split the text into
          several messages and put the markup around them.
        </li>
        <li>
          The types come from the default locale. The type of a select is its listed names plus any string: <code>other</code>{' '}
          handles the rest.
        </li>
      </ul>
    </article>
  );
}
