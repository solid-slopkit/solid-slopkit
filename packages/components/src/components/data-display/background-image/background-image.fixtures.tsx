// SSR scenarios for background-image.test.tsx.
import { BackgroundImage } from '.';

export const backgrounds = () => (
  <div>
    <BackgroundImage class="mine" src="/hero.svg" style={{ 'min-height': '10rem' }}>
      <h2>On top of the image</h2>
    </BackgroundImage>
    <BackgroundImage src={`/a "quoted" name.png`} role="img" aria-label="A mountain" />
  </div>
);
