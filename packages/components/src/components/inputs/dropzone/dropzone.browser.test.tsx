import { render } from '@solidjs/testing-library';
import { flush } from 'solid-js';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { Dropzone } from './dropzone';

afterEach(() => {
  vi.restoreAllMocks();
});

const drag = (target: Element, type: string, files: File[]) => {
  const dataTransfer = new DataTransfer();
  for (const file of files) dataTransfer.items.add(file);
  const event = new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer });
  target.dispatchEvent(event);
  flush();
  return event;
};

describe('<Dropzone /> in a browser', () => {
  test('Tab reaches it; Enter and Space open the picker', async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});
    const { getByRole } = render(() => <Dropzone onDrop={() => {}}>Drop files</Dropzone>);

    await userEvent.tab();
    expect(getByRole('button', { name: 'Drop files' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');

    expect(click).toHaveBeenCalledTimes(2);
  });

  test('a real drag: dragover is taken so the drop happens, the edge takes the role color, the files arrive', () => {
    const onDrop = vi.fn();
    const { getByRole } = render(() => (
      // No transition, so the color is read at its end.
      <Dropzone onDrop={onDrop} accept="image/*" style={{ transition: 'none' }}>
        <span>Drop images</span>
      </Dropzone>
    ));
    const root = getByRole('button');
    const idleEdge = getComputedStyle(root).borderTopColor;
    const file = new File(['a'], 'cat.png', { type: 'image/png' });

    drag(root.firstElementChild!, 'dragenter', [file]);
    const over = drag(root.firstElementChild!, 'dragover', [file]);

    expect(over.defaultPrevented).toBe(true);
    expect(root).toHaveAttribute('data-accept', '');
    expect(getComputedStyle(root).borderTopStyle).toBe('dashed');
    expect(getComputedStyle(root).borderTopColor).not.toBe(idleEdge);

    const dropped = drag(root.firstElementChild!, 'drop', [file]);

    expect(dropped.defaultPrevented).toBe(true);
    expect(onDrop).toHaveBeenCalledWith([file]);
    expect(root).not.toHaveAttribute('data-accept');
  });

  test('a type it does not take: the reject state from the MIME type alone', () => {
    const { getByRole } = render(() => (
      <Dropzone onDrop={() => {}} accept="image/*">
        Drop images
      </Dropzone>
    ));
    const root = getByRole('button');

    drag(root, 'dragenter', [new File(['a'], 'cv.pdf', { type: 'application/pdf' })]);

    expect(root).toHaveAttribute('data-reject', '');
  });

  // A synthetic drag can't set dropEffect, so only the taken dragover is checked: without it, the browser would open
  // the dropped file.
  test('disabled: dragover is still taken, so the browser does not open the file', () => {
    const { getByRole } = render(() => (
      <Dropzone onDrop={() => {}} disabled>
        Paused
      </Dropzone>
    ));

    const over = drag(getByRole('button'), 'dragover', [new File(['a'], 'a.txt')]);

    expect(over.defaultPrevented).toBe(true);
  });

  test('loading: the loader covers the zone', async () => {
    const { container } = render(() => (
      <Dropzone onDrop={() => {}} loading style={{ width: '300px', height: '160px' }}>
        Uploading
      </Dropzone>
    ));
    const root = container.querySelector('.slp-dropzone')!;
    const overlay = root.querySelector('[data-slot="dropzone-loader"]')!;
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const outer = root.getBoundingClientRect();
    const inner = overlay.getBoundingClientRect();
    // It fills the padding box, inside the 2px border.
    expect(inner.width).toBeCloseTo(outer.width - 4, 0);
    expect(inner.height).toBeCloseTo(outer.height - 4, 0);
  });
});
