import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { Input } from '../input';
import { TextInput } from '../text-input';
import { Slider } from '../slider';
import { SlopkitUi } from '../../provider';
import { InputWrapper, useInputWrapper } from './input-wrapper';

const slot = (root: Element, name: string) => root.querySelector(`[data-slot="input-wrapper-${name}"]`);

describe('<InputWrapper />', () => {
  test('a column of label, description, field and error, each in its slot', () => {
    const { container, getByRole } = render(() => (
      <InputWrapper label="Email" description="We never share it." error="Enter a valid email." class="mine">
        <Input type="email" />
      </InputWrapper>
    ));
    const root = container.firstElementChild!;
    const control = getByRole('textbox', { name: 'Email' });

    expect(root).toHaveClass('slp-input-wrapper', 'mine');
    expect(root).toHaveAttribute('data-size', 'md');
    expect(root).toHaveAttribute('data-invalid', '');
    expect(Array.from(root.children).map((child) => child.getAttribute('data-slot') ?? child.className)).toEqual([
      'input-wrapper-label',
      'input-wrapper-description',
      expect.stringContaining('slp-input'),
      'input-wrapper-error',
    ]);
    expect(slot(root, 'label')!.tagName).toBe('LABEL');
    expect(slot(root, 'label')).toHaveAttribute('for', control.id);
  });

  test('without label, description or error, only the field is rendered', () => {
    const { container } = render(() => (
      <InputWrapper>
        <Input aria-label="Bare" />
      </InputWrapper>
    ));
    const root = container.firstElementChild!;

    expect(root.children).toHaveLength(1);
    expect(root).not.toHaveAttribute('data-invalid');
  });

  test('labelSection shares a row with the label, outside it, so the accessible name is the label alone', () => {
    const { container, getByRole } = render(() => (
      <InputWrapper label="Password" labelSection={<a href="#reset">Forgot?</a>} description="8 characters or more.">
        <Input type="password" aria-label={undefined} />
      </InputWrapper>
    ));
    const root = container.firstElementChild!;
    const row = slot(root, 'label-row')!;

    expect(Array.from(root.children).map((child) => child.getAttribute('data-slot') ?? child.className)).toEqual([
      'input-wrapper-label-row',
      'input-wrapper-description',
      expect.stringContaining('slp-input'),
    ]);
    expect(Array.from(row.children).map((child) => child.getAttribute('data-slot'))).toEqual([
      'input-wrapper-label',
      'input-wrapper-label-section',
    ]);
    expect(slot(root, 'label')).not.toContainElement(getByRole('link', { name: 'Forgot?' }));
    expect(slot(root, 'label')).toHaveAttribute('for', root.querySelector('input')!.id);
    expect(slot(root, 'label')!.textContent).toBe('Password');
  });

  test('a labelSection without a label still gets its row; without either there is no row', () => {
    const { container } = render(() => (
      <>
        <InputWrapper labelSection="3 / 5">
          <Input aria-label="Code" />
        </InputWrapper>
        <InputWrapper label="Plain">
          <Input />
        </InputWrapper>
      </>
    ));
    const [sectionOnly, plain] = Array.from(container.children);

    expect(slot(sectionOnly, 'label-row')).not.toBeNull();
    expect(slot(sectionOnly, 'label')).toBeNull();
    expect(slot(sectionOnly, 'label-section')).toHaveTextContent('3 / 5');
    expect(slot(plain, 'label-row')).toBeNull();
    expect(slot(plain, 'label')!.parentElement).toBe(plain);
  });

  test('fields and sliders pass labelSection to their wrapper', () => {
    const { getByText } = render(() => (
      <SlopkitUi>
        <TextInput label="Bio" labelSection="0 / 160" />
        <Slider label="Volume" labelSection="30%" defaultValue={30} />
      </SlopkitUi>
    ));

    expect(getByText('0 / 160')).toHaveAttribute('data-slot', 'input-wrapper-label-section');
    expect(getByText('30%')).toHaveAttribute('data-slot', 'input-wrapper-label-section');
  });

  test('required: an asterisk hidden from screen readers, and a required control', () => {
    const { getByRole, container } = render(() => (
      <InputWrapper label="Email" required>
        <Input />
      </InputWrapper>
    ));
    const asterisk = slot(container, 'required')!;

    expect(asterisk).toHaveTextContent('*');
    expect(asterisk).toHaveAttribute('aria-hidden', 'true');
    expect(getByRole('textbox', { name: 'Email' })).toBeRequired();
  });

  test('withAsterisk shows the asterisk without making the control required; false hides it', () => {
    const { getAllByRole, container } = render(() => (
      <>
        <InputWrapper label="One" withAsterisk>
          <Input />
        </InputWrapper>
        <InputWrapper label="Two" required withAsterisk={false}>
          <Input />
        </InputWrapper>
      </>
    ));
    const [one, two] = getAllByRole('textbox');

    expect(container.querySelectorAll('[data-slot="input-wrapper-required"]')).toHaveLength(1);
    expect(one).not.toBeRequired();
    expect(two).toBeRequired();
  });

  test('error={true} marks the field invalid without a message', () => {
    const { getByRole, container } = render(() => (
      <InputWrapper label="Email" error>
        <Input />
      </InputWrapper>
    ));

    expect(slot(container, 'error')).toBeNull();
    expect(getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    expect(getByRole('textbox')).not.toHaveAttribute('aria-describedby');
  });

  test('id sets the control id the label points to', () => {
    const { getByRole } = render(() => (
      <InputWrapper label="Nickname" id="nick">
        <Input />
      </InputWrapper>
    ));

    expect(getByRole('textbox', { name: 'Nickname' })).toHaveAttribute('id', 'nick');
  });

  test('labelElement="div": a div label with an id, for a group that points at it', () => {
    const Group = () => {
      const wrapper = useInputWrapper()!;
      return <div role="radiogroup" aria-labelledby={wrapper.labelId()} aria-describedby={wrapper.describedBy()} />;
    };
    const { getByRole, container } = render(() => (
      <InputWrapper label="Plan" description="Change it any time." labelElement="div">
        <Group />
      </InputWrapper>
    ));
    const label = slot(container, 'label')!;

    expect(label.tagName).toBe('DIV');
    expect(label).not.toHaveAttribute('for');
    expect(getByRole('radiogroup', { name: 'Plan' })).toHaveAccessibleDescription('Change it any time.');
  });

  test('useInputWrapper is undefined outside a wrapper', () => {
    let value: unknown = 'unset';
    const Probe = () => {
      value = useInputWrapper();
      return null;
    };
    render(() => <Probe />);

    expect(value).toBeUndefined();
  });

  test('label, description and error elements are created once', () => {
    let created = 0;
    const Counted = (props: { text: string }) => {
      created++;
      return <span>{props.text}</span>;
    };
    render(() => (
      <InputWrapper
        label={<Counted text="L" />}
        labelSection={<Counted text="S" />}
        description={<Counted text="D" />}
        error={<Counted text="E" />}
      >
        <Input />
      </InputWrapper>
    ));

    expect(created).toBe(4);
  });

  test('showing an error wires it to the control without diagnostics or waste', async () => {
    const [error, setError] = createSignal<string | undefined>(undefined, { name: 'error' });
    const { getByRole } = render(() => (
      <InputWrapper label="Email" description="We never share it." error={error()}>
        <Input />
      </InputWrapper>
    ));
    flush();
    const control = getByRole('textbox');

    const { artifact } = await captureArtifact(() => setError('Enter a valid email.'), { scenario: 'input-wrapper-error' });

    expect(control).toHaveAccessibleDescription('We never share it. Enter a valid email.');
    expect(control).toHaveAttribute('aria-invalid', 'true');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();

    expect(artifact).toStayWithinRerunBudget(8);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <>
        <InputWrapper label="Email" description="We never share it." error="Enter a valid email." required>
          <Input type="email" />
        </InputWrapper>
        <InputWrapper label="Nickname" withAsterisk size="xl">
          <Input />
        </InputWrapper>
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./input-wrapper.fixtures.tsx', 'wrappers');
  });
});
