import { render } from '@solidjs/testing-library';
import { describe, expect, test } from 'vitest';
import { BackgroundImage } from './background-image';

const red =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

describe('<BackgroundImage /> in a browser', () => {
  test('the image covers the box, centered and not repeated', () => {
    const { container } = render(() => <BackgroundImage src={red} style={{ height: '100px' }} />);
    const css = getComputedStyle(container.firstElementChild!);

    expect(css.backgroundImage).toBe(`url("${red}")`);
    expect(css.backgroundSize).toBe('cover');
    expect(css.backgroundPosition).toBe('50% 50%');
    expect(css.backgroundRepeat).toBe('no-repeat');
  });

  test('a URL with quotes and spaces still resolves', () => {
    const { container } = render(() => <BackgroundImage src={'/a "b" c.png'} />);

    expect(getComputedStyle(container.firstElementChild!).backgroundImage).toMatch(/^url\(".*\/a%20%22b%22%20c\.png"\)$/);
  });

  test('the style prop can change the sizing', () => {
    const { container } = render(() => <BackgroundImage src={red} style={{ 'background-size': 'contain' }} />);

    expect(getComputedStyle(container.firstElementChild!).backgroundSize).toBe('contain');
  });
});
