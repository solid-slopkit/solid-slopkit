import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { DocTable } from '../../components/DocTable';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { withBase } from '../../base';

import Usage from '../../examples/signal-forms/usage';
import usageCode from '../../examples/signal-forms/usage.tsx?raw';
import FieldState from '../../examples/signal-forms/field-state';
import fieldStateCode from '../../examples/signal-forms/field-state.tsx?raw';

const STATE: [string, string][] = [
  ['$value()', "The field's current value, read from the store."],
  ['$set(next)', "Writes the field's value. On a container it replaces the subtree; on the root, the model."],
  ['$dirty()', 'True when the value differs from the value at form() time (deep compare).'],
  ['$touched()', 'True once the field was left (blurred) or submitted. On a container: any descendant touched.'],
  ['$markTouched()', 'Marks the field touched. bind() and control() call it on blur.'],
  ['$reset()', 'Restores the value to its initial snapshot and clears touched, across the subtree.'],
  ['$errors()', "The field's validation errors. On a container: its own plus every enabled descendant's."],
  ['$valid() / $invalid()', 'No errors / at least one. A container is valid only when every enabled descendant is.'],
  ['$disabled() / $hidden() / $readonly()', 'Set by rules here, or inherited from a container above.'],
  ['$pending()', 'True while an async validator on the field, or on a descendant, is in flight.'],
  ['$metadata(key)', 'The value a rule declared for a metadata key, or undefined.'],
  ['$submitting()', 'True while a submit() handler runs. One form-wide fact, readable on every field.'],
];

export default function FormsOverview() {
  return (
    <article class="docs-page">
      <Title>Signal forms · slopkit</Title>
      <p class="docs-eyebrow">Signal forms</p>
      <h1>Overview</h1>
      <p class="docs-lead">
        <code>@solid-slopkit/signal-forms</code> is schema-driven form state for SolidJS 2: a Solid store is the model, rules are
        attached to paths, and every field's state is a signal.
      </p>

      <H2 id="installation">Installation</H2>
      <p>
        Install <code>@solid-slopkit/signal-forms</code> from npm.
      </p>
      <CodeBlock lang="bash" code="pnpm add @solid-slopkit/signal-forms" />
      <p>
        It needs <code>solid-js</code> and <code>@solidjs/web</code> 2.x. It doesn't depend on{' '}
        <code>@solid-slopkit/components</code>, but its bindings produce exactly the props its inputs take.
      </p>

      <H2 id="model">The model and the form</H2>
      <p>
        The <strong>model</strong> is plain data in a Solid store, and stays the single source of truth.{' '}
        <code>form(model, setModel, schema?)</code> returns the <strong>field tree</strong>: an object that mirrors the model,
        where every node is a field with its own state. The schema function attaches rules to paths (<code>p.email</code>) and
        runs once.
      </p>
      <p>
        Call <code>form()</code> in a component body. Like <code>createStore</code> and <code>createMemo</code>, it lives under
        the current owner and is cleaned up with it; there is no <code>dispose</code>.
      </p>
      <Example component={Usage} code={usageCode} />
      <p>
        Errors appear once a field is touched (left once), or when <code>submit</code> touches everything. A pristine form shows
        none.
      </p>

      <H2 id="tree">Navigating the tree</H2>
      <p>
        Navigate by property access: <code>f.address.street</code>, <code>f.items[0].sku</code>. Any model key is a valid step,
        and the types follow the model. The root is itself a field over the whole model, so <code>f.$valid()</code> is the form's
        validity. A field over a primitive is a <em>leaf</em>; one over an object or array is a <em>container</em> and also
        reports state aggregated from its descendants.
      </p>

      <H2 id="field-state">Field state</H2>
      <p>
        A field's own state is read through <code>$</code>-prefixed accessors, each a signal. The prefix keeps state apart from
        navigation, so a model key called <code>value</code> or <code>errors</code> is fine. A model key that itself starts with{' '}
        <code>$</code> would collide with the accessors, so avoid those.
      </p>
      <Example component={FieldState} code={fieldStateCode} />
      <DocTable head={['Accessor', 'Meaning']} rows={STATE.map(([name, meaning]) => [<code>{name}</code>, meaning])} />

      <H2 id="notes">Notes</H2>
      <ul>
        <li>
          Write with <code>$set</code> or a binding's handler, from an event handler or an effect, never while rendering: Solid
          forbids writes in an owned scope.
        </li>
        <li>
          <code>form()</code> at module scope has no owner and leaks. Create it inside a component, or inside{' '}
          <code>createRoot</code>.
        </li>
        <li>The model is a store, so arrays change with the store setter (push, splice) and fields follow by index.</li>
      </ul>

      <H2 id="next">Next</H2>
      <ul>
        <li>
          <a href={withBase('/signal-forms/binding')}>Binding</a>: <code>bind()</code> for slopkit inputs, <code>control()</code>{' '}
          for native ones.
        </li>
        <li>
          <a href={withBase('/signal-forms/validation')}>Validation</a>,{' '}
          <a href={withBase('/signal-forms/conditions')}>Conditions and combinators</a>,{' '}
          <a href={withBase('/signal-forms/submit')}>Submit and async</a>,{' '}
          <a href={withBase('/signal-forms/metadata')}>Metadata</a>.
        </li>
      </ul>
    </article>
  );
}
