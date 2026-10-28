import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';

import Submit from '../../examples/signal-forms/submit';
import submitCode from '../../examples/signal-forms/submit.tsx?raw';
import Async from '../../examples/signal-forms/async';
import asyncCode from '../../examples/signal-forms/async.tsx?raw';

export default function FormsSubmit() {
  return (
    <article class="docs-page">
      <Title>Submit and async · Signal forms · slopkit</Title>
      <p class="docs-eyebrow">Signal forms</p>
      <h1>Submit and async</h1>
      <p class="docs-lead">Submit a valid form, and validate against a server.</p>
      <CodeBlock code={`import { submit, validateAsync } from '@solid-slopkit/signal-forms';`} />

      <H2 id="submit">submit()</H2>
      <p>
        <code>submit(f, handler)</code> does four things, in order: it marks every field touched, so all errors show; it waits for
        any async validation to settle; it stops if the form is invalid (the handler doesn't run); and otherwise it calls{' '}
        <code>handler(value)</code>. The value is the form's data with disabled fields left out. Call it from an event handler.
      </p>
      <Example component={Submit} code={submitCode} column />
      <ul>
        <li>
          <code>f.$submitting()</code> is true while the handler runs, on every field. It's false when submit was blocked.
        </li>
        <li>
          A second <code>submit()</code> while one is running is ignored, so a double click can't post twice.
        </li>
        <li>
          The handler may be async. If it throws, <code>$submitting</code> still clears and the rejection reaches the caller of{' '}
          <code>submit()</code>. Whatever it returns is ignored.
        </li>
        <li>
          The returned promise resolves when the whole call is done, also when it was blocked: await it if you need to know.
        </li>
      </ul>

      <H2 id="validate-async">validateAsync()</H2>
      <p>
        An async validator gets the same context as a sync one and returns a promise of <code>null</code> or an error. Read the
        values you depend on <strong>before</strong> the first <code>await</code>: reads after it aren't tracked, so a change to
        them wouldn't re-run the check. When the value changes while a check is running, the old result is dropped.
      </p>
      <Example component={Async} code={asyncCode} column />
      <ul>
        <li>
          <code>f.x.$pending()</code> is true while a check on the field, or on a descendant, is in flight. A disabled field runs
          no async validators.
        </li>
        <li>
          Guard empty values yourself so an empty field doesn't hit the network (<code>required</code> is the only built-in that
          reports on empty).
        </li>
        <li>
          <strong>A rejected promise counts as "no error".</strong> It clears <code>$pending</code> and nothing is reported. Catch
          network failures inside the validator and return <code>error(…)</code> if they should show.
        </li>
        <li>
          An async validator starts when its field is first reached: rendered, read in code, or touched by <code>submit()</code>,
          which reaches every field.
        </li>
      </ul>
    </article>
  );
}
