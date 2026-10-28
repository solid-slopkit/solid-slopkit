import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { Avatar } from './avatar';
import { initials } from './initials';

const fail = (img: Element) => {
  img.dispatchEvent(new Event('error'));
  flush();
};

describe('initials', () => {
  test('the first letters of the first and last words, uppercased', () => {
    expect(initials('Ada Lovelace')).toBe('AL');
    expect(initials('  grace  brewster murray hopper ')).toBe('GH');
    expect(initials('Plato')).toBe('P');
    expect(initials('élodie zhang')).toBe('ÉZ');
    expect(initials('🦊 fox')).toBe('🦊F');
    expect(initials('')).toBe('');
    expect(initials(undefined)).toBe('');
  });
});

describe('<Avatar />', () => {
  test('with src: an img in its slot, labeled by alt on the root', () => {
    const { getByRole, container } = render(() => <Avatar src="/ada.png" alt="Ada Lovelace" />);
    const avatar = getByRole('img', { name: 'Ada Lovelace' });
    const img = container.querySelector('img')!;

    expect(avatar.tagName).toBe('SPAN');
    expect(avatar).toHaveClass('slp-avatar');
    expect(avatar).toHaveAttribute('data-size', 'md');
    expect(avatar).toHaveAttribute('data-variant', 'soft');
    expect(avatar).not.toHaveAttribute('data-placeholder');
    expect(img).toHaveAttribute('data-slot', 'avatar-image');
    expect(img).toHaveAttribute('src', '/ada.png');
    expect(img).toHaveAttribute('alt', '');
  });

  test('without src: the initials of name, which also labels it', () => {
    const { getByRole } = render(() => <Avatar name="Grace Hopper" />);
    const avatar = getByRole('img', { name: 'Grace Hopper' });
    const placeholder = avatar.querySelector('[data-slot="avatar-placeholder"]')!;

    expect(avatar).toHaveAttribute('data-placeholder', '');
    expect(placeholder).toHaveTextContent('GH');
    expect(placeholder).toHaveAttribute('aria-hidden', 'true');
    expect(avatar.querySelector('img')).toBeNull();
  });

  test('children win over the initials; alt wins over name as the label', () => {
    const { getByRole } = render(() => (
      <Avatar name="Grace Hopper" alt="Admiral Hopper">
        <i>icon</i>
      </Avatar>
    ));
    const avatar = getByRole('img', { name: 'Admiral Hopper' });

    expect(avatar.querySelector('[data-slot="avatar-placeholder"]')).toHaveTextContent('icon');
  });

  test('with nothing to show: a hidden person icon, and no role or name', () => {
    const { container } = render(() => <Avatar />);
    const avatar = container.firstElementChild!;

    expect(avatar.querySelector('[data-slot="avatar-placeholder"] svg')).toHaveAttribute('aria-hidden', 'true');
    expect(avatar).not.toHaveAttribute('role');
    expect(avatar).not.toHaveAttribute('aria-label');
  });

  test('alt="" marks it decorative: hidden, with no role or label, still showing the initials', () => {
    const { container } = render(() => <Avatar name="Grace Hopper" alt="" />);
    const avatar = container.firstElementChild!;

    expect(avatar).toHaveAttribute('aria-hidden', 'true');
    expect(avatar).not.toHaveAttribute('role');
    expect(avatar).not.toHaveAttribute('aria-label');
    expect(avatar).toHaveTextContent('GH');
  });

  test('without a label, placeholder children such as a count are read as text', () => {
    const { container } = render(() => <Avatar>+3</Avatar>);
    const placeholder = container.querySelector('[data-slot="avatar-placeholder"]')!;

    expect(placeholder).toHaveTextContent('+3');
    expect(placeholder).not.toHaveAttribute('aria-hidden');
  });

  test('a failed image shows the placeholder; a new src gets its own try', () => {
    const [src, setSrc] = createSignal('/broken.png', { name: 'src' });
    const { getByRole } = render(() => <Avatar src={src()} name="Ada Lovelace" />);
    const avatar = getByRole('img', { name: 'Ada Lovelace' });

    fail(avatar.querySelector('img')!);
    expect(avatar.querySelector('img')).toBeNull();
    expect(avatar).toHaveTextContent('AL');
    expect(avatar).toHaveAttribute('data-placeholder', '');

    setSrc('/next.png');
    flush();
    expect(avatar.querySelector('img')).toHaveAttribute('src', '/next.png');
    expect(avatar).not.toHaveAttribute('data-placeholder');
  });

  test('size, color and variant are data attributes; other props pass through', () => {
    const { getByRole } = render(() => (
      <Avatar name="A" size="xl" color="error" variant="solid" id="a" class="mine" title="Hello" />
    ));
    const avatar = getByRole('img');

    expect(avatar).toHaveAttribute('data-size', 'xl');
    expect(avatar).toHaveAttribute('data-color', 'error');
    expect(avatar).toHaveAttribute('data-variant', 'solid');
    expect(avatar).toHaveAttribute('id', 'a');
    expect(avatar).toHaveAttribute('title', 'Hello');
    expect(avatar).toHaveClass('slp-avatar', 'mine');
    expect(avatar).not.toHaveAttribute('name');
  });

  test('Avatar.Group is a div of avatars', () => {
    const { container } = render(() => (
      <Avatar.Group class="mine" aria-label="Reviewers" role="group">
        <Avatar name="Alan Turing" />
        <Avatar name="Edsger Dijkstra" />
      </Avatar.Group>
    ));
    const group = container.firstElementChild!;

    expect(group.tagName).toBe('DIV');
    expect(group).toHaveClass('slp-avatar-group', 'mine');
    expect(group).toHaveAttribute('aria-label', 'Reviewers');
    expect(group.querySelectorAll('.slp-avatar')).toHaveLength(2);
  });

  test('changing the name updates the initials and label without diagnostics or waste', async () => {
    const [name, setName] = createSignal('Ada Lovelace', { name: 'name' });
    const { container } = render(() => <Avatar name={name()} />);
    flush();
    const avatar = container.firstElementChild!;

    const { artifact } = await captureArtifact(() => setName('Grace Hopper'), { scenario: 'avatar-name' });

    expect(avatar).toHaveAttribute('aria-label', 'Grace Hopper');
    expect(avatar).toHaveTextContent('GH');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(6);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <>
        <Avatar src="/ada.png" alt="Ada Lovelace" />
        <Avatar name="Grace Hopper" color="primary" />
        <Avatar name="Alan Turing" variant="solid" color="success" />
        <Avatar name="Edsger Dijkstra" variant="outline" />
        <Avatar />
        <Avatar.Group role="group" aria-label="Reviewers">
          <Avatar name="Barbara Liskov" />
          <Avatar alt="Three more">+3</Avatar>
          <Avatar>+3</Avatar>
        </Avatar.Group>
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./avatar.fixtures.tsx', 'avatars');
  });
});
