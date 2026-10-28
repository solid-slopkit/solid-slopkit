import { render } from '@solidjs/testing-library';
import { describe, expect, test } from 'vitest';
import { Breadcrumbs } from './breadcrumbs';

describe('<Breadcrumbs /> in a browser', () => {
  test('the items sit in a row, the separators spaced on both sides, and wrap when narrow', () => {
    const { getAllByRole, container } = render(() => (
      <div style={{ width: '140px' }}>
        <Breadcrumbs>
          <span>Home</span>
          <span>Components</span>
          <span>Navigation</span>
        </Breadcrumbs>
      </div>
    ));
    const items = getAllByRole('listitem');
    const separator = container.querySelector<HTMLElement>('[data-slot="breadcrumbs-separator"]')!;

    expect(getComputedStyle(separator).marginLeft).toBe('8px');
    expect(getComputedStyle(separator).marginRight).toBe('8px');
    expect(items[2].getBoundingClientRect().top).toBeGreaterThan(items[0].getBoundingClientRect().top);
  });
});
