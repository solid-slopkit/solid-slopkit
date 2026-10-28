import { render } from '@solidjs/testing-library';
import { describe, expect, test } from 'vitest';
import { VisuallyHidden } from './visually-hidden';

describe('<VisuallyHidden /> in a browser', () => {
  test('takes no space: the text around it lays out as if it were not there', () => {
    const { getByTestId } = render(() => (
      <>
        <p data-testid="with" style={{ width: '200px' }}>
          Inbox
          <VisuallyHidden>, a long text that would wrap onto several lines if it were laid out like the rest</VisuallyHidden>
        </p>
        <p data-testid="without" style={{ width: '200px' }}>
          Inbox
        </p>
      </>
    ));

    expect(getByTestId('with').getBoundingClientRect().height).toBe(getByTestId('without').getBoundingClientRect().height);
  });

  test('is clipped to nothing but still rendered', () => {
    const { getByText } = render(() => <VisuallyHidden>Close</VisuallyHidden>);
    const hidden = getByText('Close');
    const css = getComputedStyle(hidden);

    expect(css.position).toBe('absolute');
    expect(css.clipPath).toBe('inset(50%)');
    expect(css.overflow).toBe('hidden');
    expect(css.display).not.toBe('none');
    expect(css.visibility).toBe('visible');
    expect(hidden.getBoundingClientRect().width).toBeLessThanOrEqual(1);
    expect(hidden.checkVisibility()).toBe(true);
  });

  test('a block element passed with as is hidden the same way', () => {
    const { getByRole } = render(() => <VisuallyHidden as="h2">Search results</VisuallyHidden>);
    const css = getComputedStyle(getByRole('heading'));

    expect([css.position, css.clipPath, css.width, css.height]).toEqual(['absolute', 'inset(50%)', '1px', '1px']);
  });
});
