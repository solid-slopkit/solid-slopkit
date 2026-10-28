import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { describe, expect, test } from 'vitest';
import { JsonInput } from './json-input';

describe('<JsonInput /> in a browser', () => {
  test('monospace text; typing and tabbing away formats it', async () => {
    const { getByRole } = render(() => <JsonInput label="Config" formatOnBlur />);
    const control = getByRole('textbox') as HTMLTextAreaElement;

    expect(getComputedStyle(control).fontFamily).toMatch(/mono/i);
    await userEvent.click(control);
    await userEvent.keyboard('{{"a":1}');
    await userEvent.tab();

    expect(control.value).toBe('{\n  "a": 1\n}');
  });
});
