import { createSignal, onSettled, type Accessor } from 'solid-js';

export interface ImageFailure {
  /** Whether the current source failed to load. */
  failed: Accessor<boolean>;
  /** Call from the `img`'s error event. */
  onError: () => void;
}

/**
 * Tracks whether an `img`'s source failed to load. The failure belongs to one source, so a new one gets its own try.
 * It also catches a server-rendered image that failed before hydration added the error listener.
 */
export function createImageFailure(src: Accessor<string | undefined>, img: Accessor<HTMLImageElement | undefined>): ImageFailure {
  const [failedSrc, setFailedSrc] = createSignal<string | undefined>(undefined, { name: 'imageFailure.failedSrc' });
  const failed = () => src() != null && failedSrc() === src();

  // A zero width alone isn't proof: an SVG without a size has none either, so decode() decides.
  onSettled(() => {
    const el = img();
    if (!el?.complete || el.naturalWidth > 0 || !el.getAttribute('src')) return;
    const failedAtMount = src();
    el.decode().catch(() => {
      if (src() === failedAtMount) setFailedSrc(failedAtMount);
    });
  });

  return {
    failed,
    onError: () => {
      if (!failed()) setFailedSrc(src());
    },
  };
}
