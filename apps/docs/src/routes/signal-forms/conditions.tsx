import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { DocTable } from '../../components/DocTable';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';

import Conditions from '../../examples/signal-forms/conditions';
import conditionsCode from '../../examples/signal-forms/conditions.tsx?raw';
import Apply from '../../examples/signal-forms/apply';
import applyCode from '../../examples/signal-forms/apply.tsx?raw';
import ArrayExample from '../../examples/signal-forms/array';
import arrayCode from '../../examples/signal-forms/array.tsx?raw';

export default function FormsConditions() {
  return (
    <article class="docs-page">
      <Title>Conditions and combinators · Signal forms · slopkit</Title>
      <p class="docs-eyebrow">Signal forms</p>
      <h1>Conditions and combinators</h1>
      <p class="docs-lead">Disable, hide or lock a field from the model, and compose schemas across the tree.</p>
      <CodeBlock
        code={`import { disabled, hidden, readonly, schema, apply, applyWhen, applyWhenValue, applyEach } from '@solid-slopkit/signal-forms';`}
      />

      <H2 id="conditions">Conditions</H2>
      <p>
        <code>disabled</code>, <code>hidden</code> and <code>readonly</code> take a path and an optional predicate (always true
        without one). The predicate gets the same context as a validator, so it can read other fields, and the condition
        re-derives when they change. A field is in a condition when a rule on it says so, or when a container above it is. Show or
        hide the element yourself with <code>f.x.$hidden()</code>; <code>bind()</code> and <code>control()</code> carry{' '}
        <code>disabled</code> and <code>readonly</code> to the input.
      </p>
      <Example component={Conditions} code={conditionsCode} column />
      <DocTable
        head={['Condition', 'View', 'In the submitted value', 'Validated']}
        rows={[
          [<code>disabled</code>, 'Not editable', 'Left out', 'No: its errors do not count, and it never blocks its container'],
          [<code>hidden</code>, 'Yours to remove', 'Kept', 'Yes'],
          [<code>readonly</code>, 'Visible, not editable', 'Kept', 'Yes'],
        ]}
      />
      <p>
        Only <code>disabled</code> takes a field out of validation. A hidden or readonly field with an error still blocks{' '}
        <code>submit</code>. If a field is hidden because it doesn't apply, attach its rules with <code>applyWhen</code> (below)
        or disable it too.
      </p>

      <H2 id="apply">Reusable schemas: apply and applyWhen</H2>
      <p>
        <code>schema(fn)</code> makes a bundle of rules for a type. <code>apply(path, schema)</code> attaches it at a path, with
        every rule rebased under that path. <code>applyWhen(path, condition, schema)</code> attaches it only while the condition
        holds, for validators and conditions alike; <code>applyWhenValue(path, predicate, schema)</code> takes a predicate over
        the value at the path itself. A plain function works in place of a schema.
      </p>
      <Example component={Apply} code={applyCode} column />

      <H2 id="apply-each">Arrays: applyEach</H2>
      <p>
        <code>applyEach(p.items, (item) =&gt; …)</code> runs the function once as a template for every element, including ones
        added later. Reach an element with <code>f.items[i]</code>, and change the array with the store setter.
      </p>
      <Example component={ArrayExample} code={arrayCode} column />
    </article>
  );
}
