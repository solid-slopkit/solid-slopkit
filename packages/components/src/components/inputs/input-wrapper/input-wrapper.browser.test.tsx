import { render } from '@solidjs/testing-library';
import { describe, expect, test } from 'vitest';
import { Input } from '../input';
import { InputWrapper } from './input-wrapper';

const slot = (root: Element, name: string) => root.querySelector(`[data-slot="input-wrapper-${name}"]`)!;

describe('<InputWrapper /> in a browser', () => {
  test('a labelSection sits at the end of the label row, on its baseline, whatever its size', () => {
    // A zero-height inline block sits with its bottom on the text's baseline.
    const marker = { display: 'inline-block', width: '0', height: '0' };
    const { container, getByTestId } = render(() => (
      <div style={{ width: '300px' }}>
        <InputWrapper
          label={
            <>
              Amount
              <i data-testid="label-baseline" style={marker} />
            </>
          }
          labelSection={
            <span style={{ 'font-size': '24px', 'line-height': '32px' }}>
              $2,500.00
              <i data-testid="section-baseline" style={marker} />
            </span>
          }
        >
          <Input />
        </InputWrapper>
        <InputWrapper labelSection="3 / 5">
          <Input aria-label="Code" />
        </InputWrapper>
      </div>
    ));
    const [withLabel, alone] = Array.from(container.firstElementChild!.children);
    const root = withLabel.getBoundingClientRect();
    const label = slot(withLabel, 'label').getBoundingClientRect();
    const section = slot(withLabel, 'label-section').getBoundingClientRect();

    expect(Math.round(label.left)).toBe(Math.round(root.left));
    expect(Math.round(section.right)).toBe(Math.round(root.right));
    // The 14px label and the 24px value share a baseline.
    expect(Math.round(getByTestId('label-baseline').getBoundingClientRect().bottom)).toBe(
      Math.round(getByTestId('section-baseline').getBoundingClientRect().bottom),
    );
    expect(Math.round(slot(alone, 'label-section').getBoundingClientRect().right)).toBe(Math.round(root.right));
  });
});
