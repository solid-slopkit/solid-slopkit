import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { Highlight } from './highlight';
import { splitHighlight } from './split-highlight';

const marks = (container: HTMLElement) => [...container.querySelectorAll('mark')].map((mark) => mark.textContent);

describe('splitHighlight', () => {
  test('splits around every match, ignoring case', () => {
    expect(splitHighlight('A Theme and a theme', 'theme')).toEqual([
      { text: 'A ', match: false },
      { text: 'Theme', match: true },
      { text: ' and a ', match: false },
      { text: 'theme', match: true },
    ]);
  });

  test('caseSensitive matches only the same case', () => {
    expect(splitHighlight('Theme theme', 'theme', true)).toEqual([
      { text: 'Theme ', match: false },
      { text: 'theme', match: true },
    ]);
  });

  test('several terms; the longer one wins where they overlap', () => {
    expect(splitHighlight('color roles', ['color', 'color role'])).toEqual([
      { text: 'color role', match: true },
      { text: 's', match: false },
    ]);
  });

  test('regular expression characters match literally', () => {
    expect(splitHighlight('a.b axb (c)', ['a.b', '(c)'])).toEqual([
      { text: 'a.b', match: true },
      { text: ' axb ', match: false },
      { text: '(c)', match: true },
    ]);
  });

  test('empty and blank terms, and empty text, match nothing', () => {
    expect(splitHighlight('text', '')).toEqual([{ text: 'text', match: false }]);
    expect(splitHighlight('text', ['  ', ''])).toEqual([{ text: 'text', match: false }]);
    expect(splitHighlight('', 'x')).toEqual([{ text: '', match: false }]);
  });
});

describe('<Highlight />', () => {
  test('a span with the text, and each match in a Mark', () => {
    const { container } = render(() => <Highlight highlight="theme">A Theme and a theme</Highlight>);
    const root = container.firstElementChild!;

    expect(root.tagName).toBe('SPAN');
    expect(root).toHaveClass('slp-highlight');
    expect(root.textContent).toBe('A Theme and a theme');
    expect(marks(container)).toEqual(['Theme', 'theme']);
    expect(container.querySelector('mark')).toHaveClass('slp-mark');
    expect(container.querySelector('mark')).toHaveAttribute('data-color', 'warning');
  });

  test('color goes to the marks; other props pass through to the span', () => {
    const { container } = render(() => (
      <Highlight highlight="b" color="info" id="h" class="mine">
        abc
      </Highlight>
    ));
    const root = container.firstElementChild!;

    expect(container.querySelector('mark')).toHaveAttribute('data-color', 'info');
    expect(root).toHaveAttribute('id', 'h');
    expect(root).toHaveClass('slp-highlight', 'mine');
    expect(root).not.toHaveAttribute('highlight');
    expect(root).not.toHaveAttribute('data-color');
  });

  test('changing the term moves the marks without diagnostics or waste', async () => {
    const [term, setTerm] = createSignal('alpha', { name: 'term' });
    const { container } = render(() => <Highlight highlight={term()}>alpha beta gamma</Highlight>);
    flush();
    expect(marks(container)).toEqual(['alpha']);

    const { artifact } = await captureArtifact(() => setTerm('beta'), { scenario: 'highlight-term' });

    expect(marks(container)).toEqual(['beta']);
    expect(container.textContent).toBe('alpha beta gamma');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    // No toHaveNoWaste(): an unkeyed For that updates its rows in place re-runs its own memo and returns the same
    // array, which attribution counts as an unchanged recompute. Recreating the rows instead would do more work.
    expect(artifact).toStayWithinRerunBudget(9);
  });

  test('clearing the term removes the marks', () => {
    const [term, setTerm] = createSignal('beta', { name: 'term' });
    const { container } = render(() => <Highlight highlight={term()}>alpha beta</Highlight>);

    setTerm('');
    flush();

    expect(marks(container)).toEqual([]);
    expect(container.textContent).toBe('alpha beta');
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <p>
        <Highlight highlight={['color', 'role']} color="primary">
          A color role names a color.
        </Highlight>
      </p>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./highlight.fixtures.tsx', 'highlights');
  });
});
