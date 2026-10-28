import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { describe, expect, test, vi } from 'vitest';
import { SlopkitUi } from '../../provider';
import { TagsInput, type TagsInputProps } from './tags-input';

function setup(props: Partial<TagsInputProps> = {}) {
  const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
  const result = render(() => (
    <SlopkitUi>
      <form onSubmit={onSubmit} style={{ padding: '20px', width: '280px' }}>
        <TagsInput label="Tags" name="tags" {...props} />
        <button type="submit">Send</button>
      </form>
    </SlopkitUi>
  ));
  const field = () => result.getByRole('combobox', { name: 'Tags' }) as HTMLInputElement;
  const box = () => field().closest<HTMLElement>('[data-slot="pills-input-box"]')!;
  const pills = () => [...box().querySelectorAll('[data-slot="pill-label"]')].map((pill) => pill.textContent);
  const form = () => field().closest('form')!;
  return { ...result, field, box, pills, form, onSubmit };
}

describe('<TagsInput /> in a browser', () => {
  test('typing with Enter and commas adds tags without submitting; Enter on an empty field submits', async () => {
    const { field, pills, form, onSubmit } = setup();

    await userEvent.click(field());
    await userEvent.keyboard('solid{Enter}css,html, ');
    expect(pills()).toEqual(['solid', 'css', 'html']);
    expect(field()).toHaveValue(' ');
    expect(onSubmit).not.toHaveBeenCalled();

    await userEvent.keyboard('{Backspace}{Backspace}');
    expect(pills()).toEqual(['solid', 'css']);
    await userEvent.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalled();
    expect(new FormData(form()).getAll('tags')).toEqual(['solid', 'css']);
  });

  test('leaving the field adds what was typed', async () => {
    const { field, pills, getByRole } = setup();

    await userEvent.click(field());
    await userEvent.keyboard('draft');
    await userEvent.click(getByRole('button', { name: 'Send' }));
    expect(pills()).toEqual(['draft']);
  });

  test('a press on the box focuses the field', async () => {
    const { field, box } = setup({ defaultValue: ['a'] });
    const rect = box().getBoundingClientRect();

    await userEvent.click(box(), { position: { x: rect.width - 6, y: rect.height / 2 } });
    expect(field()).toHaveFocus();
  });

  test('suggestions open under the box; the arrows and Enter add one', async () => {
    const { field, box, pills, getAllByRole } = setup({ data: ['solid', 'svelte', 'react'] });

    await userEvent.click(field());
    await userEvent.keyboard('s');
    expect(getAllByRole('option').map((option) => option.textContent)).toEqual(['solid', 'svelte']);
    const dropdown = document.querySelector<HTMLElement>('.slp-combobox')!;
    await expect
      .poll(() => Math.round(dropdown.getBoundingClientRect().top))
      .toBe(Math.round(box().getBoundingClientRect().bottom + 4));

    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(pills()).toEqual(['svelte']);
    expect(field()).toHaveValue('');
    expect(field()).toHaveFocus();
  });
});
