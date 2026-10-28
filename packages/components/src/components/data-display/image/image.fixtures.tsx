// SSR scenarios for image.test.tsx.
import { Image } from '.';

const pixel = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

export const images = () => (
  <div>
    <Image class="mine" src={pixel} alt="A pixel" width={40} height={40} />
    <Image src={pixel} alt="" fit="contain" fallbackSrc={pixel} />
  </div>
);
