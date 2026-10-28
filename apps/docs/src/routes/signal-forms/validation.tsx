import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { DocTable } from '../../components/DocTable';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';
import { withBase } from '../../base';

import Validation from '../../examples/signal-forms/validation';
import validationCode from '../../examples/signal-forms/validation.tsx?raw';

const VALIDATORS: [string, string, string][] = [
  ['required(p, message?)', 'The value is empty: null, undefined, "" or [].', 'required'],
  ['min(p, n, message?) / max(p, n, message?)', 'A present number is below n / above n.', 'min / max'],
  ['minLength(p, n, message?)', 'A non-empty string or array is shorter than n. Pair it with required().', 'minLength'],
  ['maxLength(p, n, message?)', 'A string or array is longer than n.', 'maxLength'],
  ['email(p, message?)', 'A non-empty string is not a plausible email (one @, a dot in the domain, no spaces).', 'email'],
  ['pattern(p, re, message?)', 'A non-empty string does not match re.', 'pattern'],
  ['validate(p, fn)', 'Your own rule returns error(kind, message).', 'yours'],
  ['validateAsync(p, fn)', 'The same, asynchronously. See Submit and async.', 'yours'],
  ['validateStandardSchema(p, schema)', 'A Standard Schema reports issues.', 'standard'],
];

export default function FormsValidation() {
  return (
    <article class="docs-page">
      <Title>Validation · Signal forms · slopkit</Title>
      <p class="docs-eyebrow">Signal forms</p>
      <h1>Validation</h1>
      <p class="docs-lead">Rules attached to a path produce errors on the field, and containers collect them.</p>
      <CodeBlock code={`import { required, minLength, validate, error } from '@solid-slopkit/signal-forms';`} />

      <H2 id="rules">Rules in a schema function</H2>
      <p>
        The function passed to <code>form()</code> receives a <em>schema path</em> that mirrors the model. Point a validator at a
        part of it (<code>p.address.street</code>) to attach the rule. The path is only a locator; the rule runs against the live
        field. Several rules on one path all run, and their errors are listed in the order declared.
      </p>
      <Example component={Validation} code={validationCode} column />

      <H2 id="built-in">Built-in validators</H2>
      <DocTable
        head={['Validator', 'Fails when', 'Error kind']}
        rows={VALIDATORS.map(([validator, when, kind]) => [<code>{validator}</code>, when, <code>{kind}</code>])}
      />

      <H2 id="custom">Custom and cross-field rules</H2>
      <p>
        <code>validate(path, (ctx) =&gt; …)</code> returns <code>null</code> when the value is fine, or{' '}
        <code>error(kind, message?)</code>; return an array to report several. <code>ctx.value()</code> is this field's value and{' '}
        <code>ctx.valueOf(p.other)</code> reads any other field. Both are reactive, so the rule re-runs when either changes.
      </p>

      <H2 id="errors">Errors</H2>
      <p>
        <code>$errors()</code> is a list of <code>{'{ kind, field, message? }'}</code>, where <code>field</code> is the path of
        the field the error belongs to. A leaf reports its own errors; a container reports its own plus every enabled
        descendant's. <code>$valid()</code> and <code>$invalid()</code> derive from it. A disabled field reports none.
      </p>

      <H2 id="reusable">Reusable schemas</H2>
      <p>
        <code>schema(fn)</code> builds a bundle of rules that can be attached at several places with <code>apply</code>. See{' '}
        <a href={withBase('/signal-forms/conditions')}>Conditions and combinators</a>.
      </p>

      <H2 id="standard-schema">Standard Schema</H2>
      <p>
        Any schema that implements <a href="https://standardschema.dev">Standard Schema</a> plugs in without an adapter. Each
        issue lands on the field its path locates, relative to the value you validated, with the kind <code>standard</code> and
        the schema's message. Both sync and async schemas work; an async one makes the field pending while it runs. The interface
        is vendored, so the package depends on no schema library.
      </p>
      <CodeBlock
        code={`form(model, setModel, (p) => {
  validateStandardSchema(p.address, AddressSchema); // issues land on f.address.street, f.address.zip
});`}
      />
      <p>
        A Standard Schema settles on the next reactive flush rather than on the first read, so its errors appear a moment after
        the edit.
      </p>
    </article>
  );
}
