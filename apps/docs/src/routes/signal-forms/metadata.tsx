import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { DocTable } from '../../components/DocTable';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';

import Metadata from '../../examples/signal-forms/metadata';
import metadataCode from '../../examples/signal-forms/metadata.tsx?raw';

const KEYS: [string, string, string, string][] = [
  ['REQUIRED', 'required()', 'boolean', 'Any true'],
  ['MIN / MAX', 'min() / max()', 'number', 'Most restrictive: the larger min, the smaller max'],
  ['MIN_LENGTH / MAX_LENGTH', 'minLength() / maxLength()', 'number', 'Most restrictive'],
  ['PATTERN', 'pattern()', 'RegExp', 'The last declared'],
];

export default function FormsMetadata() {
  return (
    <article class="docs-page">
      <Title>Metadata · Signal forms · slopkit</Title>
      <p class="docs-eyebrow">Signal forms</p>
      <h1>Metadata</h1>
      <p class="docs-lead">Describe a field to the view: its limits, its hints, anything you key yourself.</p>
      <CodeBlock code={`import { metadata, createMetadataKey, MAX_LENGTH, REQUIRED } from '@solid-slopkit/signal-forms';`} />
      <p>
        Metadata says something <em>about</em> a field instead of judging its value. The view reads it back with{' '}
        <code>f.x.$metadata(key)</code>, reactively, so it can show a constraint without repeating it from the validators.{' '}
        <code>bind()</code> uses this for <code>required</code>.
      </p>
      <Example component={Metadata} code={metadataCode} column />

      <H2 id="built-in">Built-in keys</H2>
      <p>The built-in validators publish their limits, so a counter or a hint follows the rule.</p>
      <DocTable
        head={['Key', 'Published by', 'Type', 'Several on one field']}
        rows={KEYS.map(([key, by, type, several]) => [<code>{key}</code>, <code>{by}</code>, <code>{type}</code>, several])}
      />

      <H2 id="own-keys">Your own keys</H2>
      <p>
        <code>createMetadataKey&lt;T&gt;(description?, reduce?)</code> makes a typed key; its object identity is the key.{' '}
        <code>metadata(path, key, value)</code> attaches a value, which may be a function of the field's context and is then
        reactive. When several values are declared for one field, <code>reduce</code> combines them; without it the last wins.{' '}
        <code>$metadata(key)</code> is <code>undefined</code> when nothing is declared. To store a function as the value, wrap it:{' '}
        <code>{'() => fn'}</code>.
      </p>
    </article>
  );
}
