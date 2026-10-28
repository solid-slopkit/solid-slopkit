import { render } from '@solidjs/testing-library';
import { flush } from 'solid-js';
import { userEvent } from 'vitest/browser';
import { describe, expect, test } from 'vitest';
import { SlopkitUi, useModals, type UseModals } from '../../provider';
import { Modals } from './modals';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('<Modals /> in a browser', () => {
  test('a modal opened from another stacks above it; Escape closes the top one, and focus goes back each time', async () => {
    let api!: UseModals;
    const Opener = () => {
      api = useModals();
      return (
        <button
          type="button"
          onClick={() =>
            api.open({
              title: 'First',
              children: () => (
                <button type="button" onClick={() => api.openConfirm({ title: 'Second', children: 'Sure?' })}>
                  Open another
                </button>
              ),
            })
          }
        >
          Open
        </button>
      );
    };
    const { getByRole, container } = render(() => (
      <SlopkitUi>
        <Opener />
        <Modals />
      </SlopkitUi>
    ));
    flush();
    const dialogs = () => [...container.querySelectorAll('dialog')];

    await userEvent.click(getByRole('button', { name: 'Open' }));
    await wait(300);
    const another = getByRole('button', { name: 'Open another' });
    await userEvent.click(another);
    await wait(300);
    expect(dialogs()).toHaveLength(2);
    expect(dialogs().every((dialog) => dialog.matches(':modal'))).toBe(true);
    // The second is on top: the first is inert under it.
    const box = dialogs()[1].querySelector('[data-slot="modal-content"]')!.getBoundingClientRect();
    expect(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)?.closest('dialog')).toBe(dialogs()[1]);

    await userEvent.keyboard('{Escape}');
    await wait(300);
    expect(dialogs()).toHaveLength(1);
    expect(another).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    await wait(300);
    expect(dialogs()).toHaveLength(0);
    expect(getByRole('button', { name: 'Open' })).toHaveFocus();
  });

  test('confirm() waits for the answer', async () => {
    let api!: UseModals;
    const Grab = () => {
      api = useModals();
      return null;
    };
    const { getByRole } = render(() => (
      <SlopkitUi>
        <Grab />
        <Modals centered />
      </SlopkitUi>
    ));
    flush();

    const answer = api.confirm({ title: 'Leave?', children: 'Unsaved changes will be lost.', labels: { confirm: 'Leave' } });
    await wait(300);
    await userEvent.click(getByRole('button', { name: 'Leave' }));
    await expect(answer).resolves.toBe(true);
  });
});
