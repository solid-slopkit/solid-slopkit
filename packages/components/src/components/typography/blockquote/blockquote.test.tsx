import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import type { SlopColor } from '../../../core';
import { Blockquote } from './blockquote';

describe('<Blockquote />', () => {
  test('a figure around a blockquote, with no attribution by default', () => {
    const { getByText, container } = render(() => <Blockquote>Quoted text</Blockquote>);
    const quote = getByText('Quoted text');
    const figure = quote.parentElement!;

    expect(quote.tagName).toBe('BLOCKQUOTE');
    expect(quote).toHaveAttribute('data-slot', 'blockquote-quote');
    expect(quote).not.toHaveAttribute('cite');
    expect(figure.tagName).toBe('FIGURE');
    expect(figure).toHaveClass('slp-blockquote');
    expect(figure).not.toHaveAttribute('data-color');
    expect(container.querySelector('figcaption')).toBeNull();
  });

  test('attribution goes in a figcaption, cite on the blockquote, color and other props on the figure', () => {
    const { getByText } = render(() => (
      <Blockquote attribution={<span>Ada</span>} cite="https://example.com" color="success" id="q" class="mine">
        Quoted text
      </Blockquote>
    ));
    const quote = getByText('Quoted text');
    const figure = quote.parentElement!;
    const caption = getByText('Ada').parentElement!;

    expect(quote).toHaveAttribute('cite', 'https://example.com');
    expect(caption.tagName).toBe('FIGCAPTION');
    expect(caption).toHaveAttribute('data-slot', 'blockquote-attribution');
    expect(caption.parentElement).toBe(figure);
    expect(figure).toHaveAttribute('data-color', 'success');
    expect(figure).toHaveAttribute('id', 'q');
    expect(figure).toHaveClass('slp-blockquote', 'mine');
    expect(figure).not.toHaveAttribute('cite');
    expect(figure).not.toHaveAttribute('attribution');
  });

  test('the attribution element is created once', () => {
    let created = 0;
    const Attribution = () => {
      created++;
      return <span>Ada</span>;
    };
    render(() => <Blockquote attribution={<Attribution />}>Quoted text</Blockquote>);

    expect(created).toBe(1);
  });

  test('changing the color updates the attribute without diagnostics or waste', async () => {
    const [color, setColor] = createSignal<SlopColor>('primary', { name: 'color' });
    const { getByText } = render(() => <Blockquote color={color()}>Quoted text</Blockquote>);
    flush();
    const figure = getByText('Quoted text').parentElement!;

    const { artifact } = await captureArtifact(() => setColor('error'), { scenario: 'blockquote-color' });

    expect(figure).toHaveAttribute('data-color', 'error');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(2);
  });

  test('adding and removing the attribution shows and hides the figcaption', () => {
    const [attribution, setAttribution] = createSignal<string | undefined>(undefined, { name: 'attribution' });
    const { container } = render(() => <Blockquote attribution={attribution()}>Quoted text</Blockquote>);

    expect(container.querySelector('figcaption')).toBeNull();
    setAttribution('— Ada');
    flush();
    expect(container.querySelector('figcaption')).toHaveTextContent('— Ada');
    setAttribution(undefined);
    flush();
    expect(container.querySelector('figcaption')).toBeNull();
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <>
        <Blockquote attribution="— Ada Lovelace" cite="https://example.com" color="primary">
          <p>The engine weaves algebraic patterns.</p>
        </Blockquote>
        <Blockquote>Plain text, with no attribution.</Blockquote>
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./blockquote.fixtures.tsx', 'quotes');
  });
});
