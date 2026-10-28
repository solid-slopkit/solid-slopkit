import { render } from '@solidjs/testing-library';
import { Errored, Loading, Show, createEffect, createSignal, createStore, flush, lazy } from 'solid-js';
import { expect, test } from 'vitest';

import { form, required, submit, type SignalForm } from './index';

const tick = () => new Promise((r) => setTimeout(r, 0));

// A guard that redirects from an effect while the first load is still held, onto a lazily loaded page with a form.
// The form's root `errors` memo is not read until `submit`, after the load lands: Solid then computes it for the first
// time and still compares the result against a previous value it never had (`undefined`).
test('a form mounted by a redirect during the first load reads its errors after submit', async () => {
  type Model = { email: string };
  let resolveSession!: (session: string | null) => void;
  const [session] = createSignal(() => new Promise<string | null>((r) => (resolveSession = r)));
  const [page, setPage] = createSignal<'home' | 'login'>('home');
  let f!: SignalForm<Model>;
  let caught: unknown;

  function Login() {
    const [model, setModel] = createStore<Model>({ email: '' });
    f = form(model, setModel, (p) => required(p.email));
    return <p>{f.email.$errors().length}</p>;
  }
  let loadLogin!: () => void;
  const LazyLogin = lazy(() => new Promise<{ default: typeof Login }>((r) => (loadLogin = () => r({ default: Login }))));
  function Guard() {
    createEffect(
      () => session(),
      (s) => {
        if (!s) setPage('login');
      },
    );
    return null;
  }

  render(() => (
    <Errored fallback={(e) => ((caught = e), (<p>failed</p>))}>
      <Loading fallback={<p>loading</p>}>
        <Guard />
        <span>{session()}</span>
        <Show when={page() === 'login'} fallback={<p>home</p>}>
          <LazyLogin />
        </Show>
      </Loading>
    </Errored>
  ));
  flush();
  resolveSession(null);
  await tick();
  flush();
  loadLogin();
  await tick();
  flush();

  let called = false;
  await submit(f, () => {
    called = true;
  });
  flush();

  expect(caught).toBeUndefined();
  expect(called).toBe(false);
  expect(f.email.$errors()).toHaveLength(1);
  expect(f.$errors()).toHaveLength(1);
});
