import { fireEvent, render as renderBare } from '@solidjs/testing-library';
import type { JSX } from '@solidjs/web';
import { captureArtifact } from '@solidjs/diagnostics';
import { createStore, flush } from 'solid-js';
import { describe, expect, test } from 'vitest';
import { TextInput, SlopkitUi } from '@solid-slopkit/components';

// The ui inputs must render inside the provider.
const render = (ui: () => JSX.Element) => renderBare(ui, { wrapper: (props) => <SlopkitUi>{props.children}</SlopkitUi> });

import { bind, form, required, type SignalForm } from './index';

type Model = { name: string; email: string };

function mount() {
  const [model, setModel] = createStore<Model>({ name: 'Ada', email: 'ada@b.co' });
  let f!: SignalForm<Model>;
  const utils = render(() => {
    f = form(model, setModel, (p) => {
      required(p.name);
      required(p.email);
    });
    return (
      <form>
        <TextInput id="name" label="Name" {...bind.text(f.name)} />
        <TextInput id="email" label="Email" {...bind.text(f.email)} />
      </form>
    );
  });
  flush();
  return { f: f!, ...utils };
}

describe('bind() reactivity budgets', () => {
  test('a keystroke in one bound input leaves the other input alone', async () => {
    const { container } = mount();
    const name = container.querySelector<HTMLInputElement>('#name')!;
    const { artifact } = await captureArtifact(
      async () => {
        name.value = 'Adam';
        fireEvent.input(name);
        flush();
        await Promise.resolve();
      },
      { scenario: 'bind-keystroke' },
    );
    expect(artifact).toHaveNoDiagnostics();
    // Nothing that belongs to the email field or the form rollups re-runs for a name edit.
    expect(artifact).toStayWithinRerunBudget(0, { scope: /@(email|root)$/ });
    // The edited input only: the `touched` memo re-checks (a Leaf reads its value to learn it is
    // one) and stays unchanged, then the TextInput value and its spread update.
    expect(artifact).toStayWithinRerunBudget(3);
  });

  test('blurring an invalid field shows its error without touching the sibling', async () => {
    const { f, container } = mount();
    f.name.$set('');
    flush();
    const name = container.querySelector<HTMLInputElement>('#name')!;
    const { artifact } = await captureArtifact(
      () => {
        fireEvent.blur(name);
        flush();
      },
      { scenario: 'bind-blur-error' },
    );
    expect(artifact).toHaveNoDiagnostics();
    expect(artifact).toStayWithinRerunBudget(0, { scope: /@(email|root)$/ });
    // The error appearing: `touched`, then the wrapper's describedBy, error condition, children
    // and the two attribute spreads. The sibling input and the label do not re-run.
    expect(artifact).toStayWithinRerunBudget(9);
  });
});
