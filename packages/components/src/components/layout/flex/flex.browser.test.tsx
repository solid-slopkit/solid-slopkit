import { render } from '@solidjs/testing-library';
import { flush } from 'solid-js';
import { page } from 'vitest/browser';
import { afterEach, describe, expect, test } from 'vitest';
import { SlopkitUi } from '../../provider';
import { Box } from '../box';
import { Flex } from './flex';

const rect = (el: Element) => {
  const { left, top } = el.getBoundingClientRect();
  return { left: Math.round(left), top: Math.round(top) };
};

// Box and Flex together: the generated classes reach the page and lay it out.
describe('<Box /> and <Flex /> in a browser', () => {
  afterEach(() => page.viewport(414, 896));

  test('Box spacing and size props apply, and a side wins over the shorthand', async () => {
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <Box data-testid="box" p={4} pl={2} mx="auto" w={40} />
      </SlopkitUi>
    ));
    flush();
    const style = getComputedStyle(getByTestId('box'));

    await expect.poll(() => [style.paddingTop, style.paddingRight, style.paddingLeft]).toEqual(['16px', '16px', '8px']);
    expect(style.width).toBe('160px');
    expect(style.marginLeft).toBe(style.marginRight);
  });

  test('Flex lays out children, and switches direction and gap at a breakpoint', async () => {
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <Flex data-testid="flex" direction={{ base: 'column', md: 'row' }} gap={{ base: 2, md: 4 }}>
          <Box data-testid="a" w={10} h={10} />
          <Box data-testid="b" w={10} h={10} />
        </Flex>
      </SlopkitUi>
    ));
    flush();
    const a = () => rect(getByTestId('a'));
    const b = () => rect(getByTestId('b'));

    await page.viewport(600, 800);
    await expect.poll(() => b().top - a().top).toBe(40 + 8);
    expect(b().left).toBe(a().left);

    await page.viewport(1000, 800); // md is 62em, 992px
    await expect.poll(() => b().left - a().left).toBe(40 + 16);
    expect(b().top).toBe(a().top);
  });

  test('Flex display hides it below a breakpoint', async () => {
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <Flex data-testid="flex" display={{ base: 'none', sm: 'inline-flex' }} />
      </SlopkitUi>
    ));
    flush();
    const display = () => getComputedStyle(getByTestId('flex')).display;

    await page.viewport(600, 800);
    await expect.poll(display).toBe('none');
    await page.viewport(800, 800);
    await expect.poll(display).toBe('inline-flex');
  });
});
