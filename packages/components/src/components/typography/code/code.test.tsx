import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { Code } from './code';

describe('<Code />', () => {
  test('inline: a code element with its text; other props pass through', () => {
    const { getByText } = render(() => (
      <Code id="c" class="mine" title="Command">
        pnpm install
      </Code>
    ));
    const code = getByText('pnpm install');

    expect(code.tagName).toBe('CODE');
    expect(code).toHaveClass('slp-code', 'mine');
    expect(code).toHaveAttribute('id', 'c');
    expect(code).toHaveAttribute('title', 'Command');
    expect(code).not.toHaveAttribute('data-block');
    expect(code).not.toHaveAttribute('tabindex');
  });

  test('block: a focusable pre around a code slot', () => {
    const { getByText } = render(() => (
      <Code block id="b" class="mine">
        const answer = 42;
      </Code>
    ));
    const content = getByText('const answer = 42;');
    const pre = content.parentElement!;

    expect(content.tagName).toBe('CODE');
    expect(content).toHaveAttribute('data-slot', 'code-content');
    expect(pre.tagName).toBe('PRE');
    expect(pre).toHaveClass('slp-code', 'mine');
    expect(pre).toHaveAttribute('data-block', '');
    expect(pre).toHaveAttribute('tabindex', '0');
    expect(pre).toHaveAttribute('id', 'b');
    expect(pre).not.toHaveAttribute('block');
  });

  test('block: tabindex can be overridden', () => {
    const { getByText } = render(() => (
      <Code block tabindex={-1}>
        x
      </Code>
    ));

    expect(getByText('x').parentElement).toHaveAttribute('tabindex', '-1');
  });

  test('changing the content updates only the text, without diagnostics or waste', async () => {
    const [source, setSource] = createSignal('let a = 1;', { name: 'source' });
    const { getByText } = render(() => <Code block>{source()}</Code>);
    flush();
    const pre = getByText('let a = 1;').parentElement!;

    const { artifact } = await captureArtifact(() => setSource('let b = 2;'), { scenario: 'code-content' });

    expect(pre).toHaveTextContent('let b = 2;');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(2);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <>
        <p>
          Run <Code>pnpm install</Code> first.
        </p>
        <Code block>{'const answer = 42;\nconsole.log(answer);'}</Code>
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./code.fixtures.tsx', 'inlineAndBlock');
  });
});
