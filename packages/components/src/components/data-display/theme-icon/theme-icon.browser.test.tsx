import { render } from '@solidjs/testing-library';
import { describe, expect, test } from 'vitest';
import { ThemeIcon } from './theme-icon';

const rect = (el: Element) => {
  const { width, height } = el.getBoundingClientRect();
  return { width: Math.round(width), height: Math.round(height) };
};

describe('<ThemeIcon /> in a browser', () => {
  test('sizes are squares; an SVG child is 60% of the box and centered; corners scale', () => {
    const { container } = render(() => (
      <div style={{ display: 'flex', 'align-items': 'start' }}>
        <ThemeIcon size="xs">
          <svg viewBox="0 0 24 24" />
        </ThemeIcon>
        <ThemeIcon size="sm">
          <svg viewBox="0 0 24 24" />
        </ThemeIcon>
        <ThemeIcon>
          <svg viewBox="0 0 24 24" />
        </ThemeIcon>
        <ThemeIcon size="lg">
          <svg viewBox="0 0 24 24" />
        </ThemeIcon>
        <ThemeIcon size="xl">
          <svg viewBox="0 0 24 24" />
        </ThemeIcon>
      </div>
    ));
    const boxes = [...container.querySelectorAll('.slp-theme-icon')];
    const md = boxes[2];
    const box = md.getBoundingClientRect();
    const icon = md.querySelector('svg')!.getBoundingClientRect();

    expect(boxes.map((el) => rect(el).width)).toEqual([20, 26, 32, 40, 48]);
    expect(boxes.map((el) => rect(el).height)).toEqual([20, 26, 32, 40, 48]);
    expect(rect(md.querySelector('svg')!)).toEqual({ width: 18, height: 18 });
    expect(Math.round(icon.left - box.left)).toBe(Math.round(box.right - icon.right));
    expect(getComputedStyle(md).borderTopLeftRadius).toBe('8px');
  });

  test('variants color the box from the role', () => {
    const { container, getByTestId } = render(() => (
      <>
        <ThemeIcon color="success">s</ThemeIcon>
        <ThemeIcon color="success" variant="soft">
          s
        </ThemeIcon>
        <ThemeIcon color="success" variant="outline">
          o
        </ThemeIcon>
        <span data-testid="role" style={{ color: 'var(--slp-color-success)' }} />
        <span data-testid="content" style={{ color: 'var(--slp-color-success-content)' }} />
      </>
    ));
    const [solid, soft, outline] = [...container.querySelectorAll('.slp-theme-icon')].map((el) => getComputedStyle(el));
    const role = getComputedStyle(getByTestId('role')).color;
    const content = getComputedStyle(getByTestId('content')).color;

    expect([solid.backgroundColor, solid.color]).toEqual([role, content]);
    expect(soft.color).toBe(role);
    expect(soft.backgroundColor).toMatch(/\/ 0\.12\)$/);
    expect([outline.backgroundColor, outline.color]).toEqual(['rgba(0, 0, 0, 0)', role]);
    // The border is half the role.
    expect(outline.borderTopColor).toMatch(/\/ 0\.5\)$/);
  });

  test('--slp-theme-icon-color overrides the role', () => {
    const { container } = render(() => (
      <ThemeIcon color="primary" style={{ '--slp-theme-icon-color': 'rgb(1, 2, 3)', '--slp-theme-icon-content': 'rgb(4, 5, 6)' }}>
        x
      </ThemeIcon>
    ));
    const css = getComputedStyle(container.firstElementChild!);

    expect([css.backgroundColor, css.color]).toEqual(['rgb(1, 2, 3)', 'rgb(4, 5, 6)']);
  });
});
