import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush, Show } from 'solid-js';
import axe from 'axe-core';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { modals, SlopkitUi, useLocale, useModals, type UseModals } from '../../provider';
import { Modals, type ModalsProps } from './modals';

// Closing settles a microtask after a change when nothing animates, as in jsdom.
const settle = async () => {
  flush();
  for (let tick = 0; tick < 4; tick++) await Promise.resolve();
  flush();
};

function setup(props: ModalsProps = {}) {
  let api!: UseModals;
  const Grab = () => {
    api = useModals();
    return null;
  };
  const result = render(() => (
    <SlopkitUi locale="de-DE">
      <Grab />
      <Modals {...props} />
    </SlopkitUi>
  ));
  flush();
  const dialogs = () => [...result.container.querySelectorAll('dialog')];
  const button = (name: string) => result.getByRole('button', { name, hidden: true });
  const click = async (name: string) => {
    fireEvent.click(button(name));
    await settle();
  };
  return { ...result, api: () => api, dialogs, button, click };
}

afterEach(() => vi.restoreAllMocks());

describe('<Modals />', () => {
  test('open() shows a modal with its title and content, and returns its id', async () => {
    const { api, dialogs } = setup();

    const id = api().open({ title: 'Terms', children: 'Read them carefully.' });
    await settle();

    expect(id).toMatch(/^slp-modal-/);
    expect(dialogs()).toHaveLength(1);
    expect(dialogs()[0]).toHaveClass('slp-modal');
    expect(dialogs()[0]).toHaveAttribute('open');
    expect(dialogs()[0].querySelector('[data-slot="modal-title"]')).toHaveTextContent('Terms');
    expect(dialogs()[0].querySelector('[data-slot="modal-body"]')).toHaveTextContent('Read them carefully.');
  });

  test('content given as a function is rendered inside the provider', async () => {
    const { api, dialogs } = setup();
    const Locale = () => {
      const locale = useLocale();
      return <p>{locale()}</p>;
    };

    api().open({ title: 'Locale', children: () => <Locale /> });
    await settle();
    expect(dialogs()[0]).toHaveTextContent('de-DE');
  });

  test('close() closes it; onClose is called once it has gone', async () => {
    const onClose = vi.fn();
    const { api, dialogs, click } = setup();

    const id = api().open({ title: 'One', children: 'First', onClose });
    api().open({ title: 'Two', children: 'Second' });
    await settle();
    expect(dialogs()).toHaveLength(2);

    api().close(id);
    await settle();
    expect(dialogs().map((dialog) => dialog.textContent)).toEqual([expect.stringContaining('Second')]);
    expect(onClose).toHaveBeenCalledTimes(1);

    await click('Close');
    expect(dialogs()).toEqual([]);
    expect(api().modals()).toEqual([]);
  });

  test('closeAll() closes every one', async () => {
    const { api, dialogs } = setup();
    api().open({ title: 'One' });
    api().open({ title: 'Two' });
    await settle();
    api().closeAll();
    await settle();
    expect(dialogs()).toEqual([]);
  });

  test('update() changes an open modal, keeping its content', async () => {
    const { api, dialogs, getByRole } = setup();
    const [count, setCount] = createSignal(0);
    const id = api().open({
      title: 'Before',
      children: () => (
        <button type="button" onClick={() => setCount(count() + 1)}>
          Clicked {count()}
        </button>
      ),
    });
    await settle();
    const content = getByRole('button', { name: 'Clicked 0', hidden: true });

    api().update(id, { title: 'After', size: 'xl' });
    flush();
    expect(dialogs()[0].querySelector('[data-slot="modal-title"]')).toHaveTextContent('After');
    expect(dialogs()[0]).toHaveAttribute('data-size', 'xl');
    expect(getByRole('button', { name: 'Clicked 0', hidden: true })).toBe(content);
  });

  test("the host's props are every modal's defaults, which a modal's own settings override", async () => {
    const { api, dialogs } = setup({ size: 'lg', centered: true });
    api().open({ title: 'Default' });
    api().open({ title: 'Own', size: 'xs' });
    await settle();
    expect(dialogs()[0]).toHaveAttribute('data-size', 'lg');
    expect(dialogs()[0]).toHaveAttribute('data-centered');
    expect(dialogs()[1]).toHaveAttribute('data-size', 'xs');
  });

  test('a confirm modal: its content, then cancel and confirm; confirming calls onConfirm and closes it', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const { api, dialogs, button, click } = setup();

    api().openConfirm({
      title: 'Delete project',
      children: 'This cannot be undone.',
      labels: { confirm: 'Delete' },
      confirmProps: { color: 'error' },
      onConfirm,
      onCancel,
    });
    await settle();

    const actions = dialogs()[0].querySelector('[data-slot="modals-confirm-actions"]')!;
    expect([...actions.querySelectorAll('button')].map((element) => element.textContent)).toEqual(['Cancel', 'Delete']);
    expect(button('Delete')).toHaveAttribute('data-color', 'error');

    await click('Delete');
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
    expect(dialogs()).toEqual([]);
  });

  test('the cancel button, the close button and Escape cancel', async () => {
    const { api, click, dialogs } = setup();

    for (const close of ['Cancel', 'Close', 'Escape']) {
      const onCancel = vi.fn();
      api().openConfirm({ title: 'Sure?', onCancel });
      await settle();
      if (close === 'Escape') {
        fireEvent.keyDown(dialogs()[0], { key: 'Escape' });
        await settle();
      } else await click(close);
      expect(onCancel, close).toHaveBeenCalledTimes(1);
      expect(dialogs(), close).toEqual([]);
    }
  });

  test('closeOnConfirm: false keeps it open until close(), which then cancels nothing', async () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    const { api, click, dialogs } = setup();
    const id = api().openConfirm({ title: 'Save', closeOnConfirm: false, onConfirm, onCancel });
    await settle();

    await click('Confirm');
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(dialogs()).toHaveLength(1);

    api().close(id);
    await settle();
    expect(dialogs()).toEqual([]);
    expect(onCancel).not.toHaveBeenCalled();
  });

  test('confirm() resolves true when confirmed and false when cancelled', async () => {
    const { api, click } = setup();

    const yes = api().confirm({ title: 'Sure?' });
    await settle();
    await click('Confirm');
    await expect(yes).resolves.toBe(true);

    const no = api().confirm({ title: 'Sure?' });
    await settle();
    await click('Cancel');
    await expect(no).resolves.toBe(false);
  });

  test('has no axe violations', async () => {
    const { api, container } = setup();
    api().openConfirm({ title: 'Delete project', children: 'This cannot be undone.' });
    await settle();
    expect((await axe.run(container)).violations).toEqual([]);
  });

  test('opening, updating and confirming have no diagnostics or waste', async () => {
    const { api, click } = setup();
    const { artifact } = await captureArtifact(
      async () => {
        const id = api().openConfirm({ title: 'One', children: 'Sure?' });
        await settle();
        api().update(id, { title: 'Two' });
        flush();
        await click('Confirm');
      },
      { scenario: 'modals' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    // update() replaces a modal's settings as one object, so what reads them checks once whether its part changed:
    // the content, the buttons' disabled, Modal's own props. Plus the presence's mounted flag on each status.
    expect(artifact).toHaveNoWaste({ maxWastedRuns: 6 });
    expect(artifact).toStayWithinRerunBudget(4, { scope: /^modal\.children$/ });
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./modals.fixtures.tsx', 'host');
  });
});

describe('useModals() and the modals facade', () => {
  test('the hook throws outside <SlopkitUi>', () => {
    const Lost = () => {
      useModals();
      return null;
    };
    expect(() => render(() => <Lost />)).toThrow('useModals() must be called inside <SlopkitUi>.');
  });

  test('the facade reaches the most recently mounted provider', async () => {
    const [second, setSecond] = createSignal(true);
    const { container } = render(() => (
      <>
        <div class="first">
          <SlopkitUi>
            <Modals />
          </SlopkitUi>
        </div>
        <Show when={second()}>
          <div class="second">
            <SlopkitUi>
              <Modals />
            </SlopkitUi>
          </div>
        </Show>
      </>
    ));
    flush();

    const id = modals.open({ title: 'To the second' });
    await settle();
    expect(container.querySelector('.second dialog')).toHaveTextContent('To the second');
    modals.close(id);
    await settle();

    setSecond(false);
    flush();
    modals.open({ title: 'To the first' });
    await settle();
    expect(container.querySelector('.first dialog')).toHaveTextContent('To the first');
    modals.closeAll();
    await settle();
  });

  test('without a host, opening warns and closes at once; confirm() resolves false', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    let api!: UseModals;
    const Grab = () => {
      api = useModals();
      return null;
    };
    render(() => (
      <SlopkitUi>
        <Grab />
      </SlopkitUi>
    ));
    const onClose = vi.fn();
    api.open({ title: 'Nowhere', onClose });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no <Modals> is mounted'));
    expect(onClose).toHaveBeenCalled();
    await expect(api.confirm({ title: 'Sure?' })).resolves.toBe(false);
    expect(api.modals()).toEqual([]);
  });
});
