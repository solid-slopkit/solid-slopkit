import { render } from '@solidjs/testing-library';
import { describe, expect, test } from 'vitest';
import { Avatar } from './avatar';

const wide =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAACCAYAAAB/qH1jAAAAEUlEQVR42mP8z8Dwn4EIwDiqEAAhAgP/x7a6fAAAAABJRU5ErkJggg==';

const rect = (el: Element) => {
  const { left, width, height } = el.getBoundingClientRect();
  return { left: Math.round(left), width: Math.round(width), height: Math.round(height) };
};

describe('<Avatar /> in a browser', () => {
  test('sizes are fixed squares, rounded into circles', () => {
    const { getAllByRole } = render(() => (
      <div style={{ display: 'flex', 'align-items': 'start' }}>
        <Avatar name="X S" size="xs" />
        <Avatar name="S M" size="sm" />
        <Avatar name="M D" />
        <Avatar name="L G" size="lg" />
        <Avatar name="X L" size="xl" />
      </div>
    ));
    const avatars = getAllByRole('img');

    expect(avatars.map((avatar) => rect(avatar).width)).toEqual([24, 32, 40, 56, 80]);
    expect(avatars.map((avatar) => rect(avatar).height)).toEqual([24, 32, 40, 56, 80]);
    expect(getComputedStyle(avatars[2]).borderTopLeftRadius).toBe('50%');
  });

  test('a picture of another aspect ratio fills the circle, cropped', () => {
    const { container } = render(() => <Avatar src={wide} alt="Wide" />);
    const img = container.querySelector('img')!;

    expect(rect(img)).toMatchObject({ width: 40, height: 40 });
    expect(getComputedStyle(img).objectFit).toBe('cover');
  });

  test('a long placeholder stays inside the circle', () => {
    const { getByRole } = render(() => (
      <Avatar alt="Many" size="xs">
        +1234
      </Avatar>
    ));

    expect(rect(getByRole('img')).width).toBe(24);
  });

  test('in a group, each avatar tucks under its neighbour by a quarter of its size, ringed in the surface color', () => {
    const { getAllByRole } = render(() => (
      <Avatar.Group>
        <Avatar name="A A" />
        <Avatar name="B B" />
        <Avatar name="C C" />
      </Avatar.Group>
    ));
    const [first, second] = getAllByRole('img');

    expect(rect(second).left - rect(first).left).toBe(30);
    expect(getComputedStyle(first).boxShadow).toMatch(/0px 0px 0px 2px$/);
  });

  test('placeholders are opaque, so overlapping avatars do not show through', () => {
    const { getAllByRole } = render(() => (
      <>
        <Avatar name="S S" color="primary" />
        <Avatar name="O O" color="primary" variant="outline" />
      </>
    ));

    for (const avatar of getAllByRole('img')) {
      expect(getComputedStyle(avatar).backgroundColor).not.toMatch(/\/ 0(\.\d+)?\)$|rgba\(.*, 0(\.\d+)?\)$/);
    }
  });

  test('an outline placeholder has a border of half its color, or a faint one without a color', () => {
    const { container } = render(() => (
      <>
        <Avatar variant="outline" color="primary" name="Ada Lovelace" />
        <Avatar variant="outline" name="Alan Turing" />
      </>
    ));
    const [colored, plain] = [...container.querySelectorAll('.slp-avatar')].map((el) => getComputedStyle(el).borderTopColor);

    expect(colored).toMatch(/\/ 0\.5\)$/);
    expect(plain).toMatch(/\/ 0\.2\)$/);
  });
});
