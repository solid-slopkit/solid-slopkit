import { render } from '@solidjs/testing-library';
import { describe, expect, test } from 'vitest';
import { Card } from './card';

const IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'/%3E";

const rect = (el: Element) => {
  const { left, top, width, height } = el.getBoundingClientRect();
  return { left: Math.round(left), top: Math.round(top), width: Math.round(width), height: Math.round(height) };
};

describe('<Card /> in a browser', () => {
  test('vertical: a flush image, parts spaced by 16px, and a flush muted footer below a divider', async () => {
    const { getByRole, getByText, getByTestId } = render(() => (
      <Card data-testid="card" style={{ width: '402px' }}>
        <Card.Image src={IMAGE} alt="Cover" />
        <Card.Header>Header</Card.Header>
        <Card.Body>Body</Card.Body>
        <Card.Footer>Footer</Card.Footer>
      </Card>
    ));
    const image = getByRole('img', { name: 'Cover' }) as HTMLImageElement;
    await image.decode();
    const card = rect(getByTestId('card'));

    // A 1px border on each side.
    expect(rect(image)).toMatchObject({ left: card.left + 1, top: card.top + 1, width: 400, height: 300 });
    const header = rect(getByText('Header'));
    const body = rect(getByText('Body'));
    const footer = rect(getByText('Footer'));
    expect(header.top).toBe(card.top + 1 + 300 + 16);
    expect(getComputedStyle(getByText('Header')).paddingLeft).toBe('16px');
    expect(body.top).toBe(header.top + header.height + 16);
    expect(footer.top).toBe(body.top + body.height + 16);
    // The footer ends at the card's inner bottom edge.
    expect(footer.top + footer.height).toBe(card.top + card.height - 1);
    const footerCss = getComputedStyle(getByText('Footer'));
    expect([footerCss.borderTopStyle, footerCss.paddingTop]).toEqual(['solid', '16px']);
    expect(footerCss.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('without an image or footer, the card pads its top and bottom; size sm tightens the spacing to 12px', () => {
    const { getByText, getByTestId } = render(() => (
      <>
        <Card data-testid="md">
          <Card.Body>Medium</Card.Body>
        </Card>
        <Card data-testid="sm" size="sm">
          <Card.Header>Small header</Card.Header>
          <Card.Body>Small</Card.Body>
        </Card>
      </>
    ));
    const md = rect(getByTestId('md'));
    const medium = rect(getByText('Medium'));
    expect(medium.top).toBe(md.top + 1 + 16);
    expect(md.top + md.height).toBe(medium.top + medium.height + 16 + 1);

    const sm = rect(getByTestId('sm'));
    const smallHeader = rect(getByText('Small header'));
    expect(smallHeader.top).toBe(sm.top + 1 + 12);
    expect(rect(getByText('Small')).top).toBe(smallHeader.top + smallHeader.height + 12);
    expect(getComputedStyle(getByText('Small')).paddingLeft).toBe('12px');
  });

  test('a header with a title and description stacks the two at the start and puts the rest at the end, top-aligned', () => {
    const { getByRole, getByText, getByTestId } = render(() => (
      <Card style={{ width: '402px' }}>
        <Card.Header data-testid="header">
          <Card.Title>Payout</Card.Title>
          <Card.Description>Set the minimum balance.</Card.Description>
          <button type="button" style={{ width: '24px', height: '24px', padding: '0' }}>
            A
          </button>
          <button type="button" style={{ width: '24px', height: '24px', padding: '0' }}>
            B
          </button>
        </Card.Header>
      </Card>
    ));
    const header = rect(getByTestId('header'));
    const title = rect(getByRole('heading', { name: 'Payout' }));
    const description = rect(getByText('Set the minimum balance.'));
    const a = rect(getByRole('button', { name: 'A' }));
    const b = rect(getByRole('button', { name: 'B' }));

    // The header pads its sides by 16px (the card pads above it); the description under the title with a 4px gap.
    expect(title).toMatchObject({ left: header.left + 16, top: header.top });
    expect(description.left).toBe(title.left);
    expect(description.top).toBe(title.top + title.height + 4);
    // The buttons side by side at the end, level with the title, with the header's 8px gap between them.
    expect(a.top).toBe(title.top);
    expect(b.top).toBe(title.top);
    expect(b.left + b.width).toBe(header.left + header.width - 16);
    expect(b.left).toBe(a.left + a.width + 8);
    expect(title.width).toBe(a.left - 8 - title.left);
  });

  test('variants', () => {
    const { getByText } = render(() => (
      <>
        <Card variant="soft">
          <Card.Body>Soft</Card.Body>
        </Card>
        <Card variant="elevated">
          <Card.Body>Elevated</Card.Body>
        </Card>
      </>
    ));
    const soft = getComputedStyle(getByText('Soft').parentElement!);
    const elevated = getComputedStyle(getByText('Elevated').parentElement!);

    expect(soft.borderTopColor).toBe('rgba(0, 0, 0, 0)');
    expect(elevated.boxShadow).not.toBe('none');
  });

  test('horizontal: the image fills a start column as tall as the other parts', async () => {
    const { getByRole, getByText, getByTestId } = render(() => (
      <Card data-testid="card" orientation="horizontal" style={{ width: '502px' }}>
        <Card.Image src={IMAGE} alt="Side" />
        <Card.Header>Header</Card.Header>
        <Card.Body>Body</Card.Body>
        <Card.Footer>Footer</Card.Footer>
      </Card>
    ));
    const card = rect(getByTestId('card'));
    const image = getByRole('img', { name: 'Side' }) as HTMLImageElement;
    await image.decode();

    // 2fr of 500px, and the card's full inner height rather than the image's 300px.
    expect(rect(image)).toMatchObject({ left: card.left + 1, top: card.top + 1, width: 200, height: card.height - 2 });
    expect(card.height).toBeLessThan(300);
    expect(rect(getByText('Body')).left).toBe(card.left + 1 + 200);
    expect(rect(getByText('Footer')).top).toBeGreaterThan(rect(getByText('Body')).top);
  });
});
