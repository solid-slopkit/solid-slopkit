import { Anchor, Blockquote } from '@solid-slopkit/components';

const source = 'https://en.wikipedia.org/wiki/Ada_Lovelace';

export default function Basic() {
  return (
    <Blockquote
      cite={source}
      attribution={
        <>
          — Ada Lovelace,{' '}
          <Anchor href={source} underline="hover">
            Notes on the Analytical Engine
          </Anchor>
        </>
      }
    >
      The Analytical Engine weaves algebraical patterns just as the Jacquard-loom weaves flowers and leaves.
    </Blockquote>
  );
}
