import { ArrowUp } from '@lucide/solid';
import { createSignal, onSettled } from 'solid-js';
import { Affix, Button, Text, Transition } from '@solid-slopkit/components';

export default function Basic() {
  const [scrolled, setScrolled] = createSignal(false);

  onSettled(() => {
    const onScroll = () => setScrolled(window.scrollY > 300);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  });

  return (
    <>
      <Text>Scroll the page down: a button back to the top appears in the bottom right corner.</Text>
      <Affix>
        <Transition mounted={scrolled()} transition="fade-up">
          {(transition) => (
            <Button {...transition} leftSection={<ArrowUp />} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              Back to top
            </Button>
          )}
        </Transition>
      </Affix>
    </>
  );
}
