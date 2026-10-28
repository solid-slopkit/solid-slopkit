// SSR scenarios for aspect-ratio.test.tsx.
import { AspectRatio } from '.';

export const ratios = () => (
  <>
    <AspectRatio ratio={16 / 9} class="mine">
      <img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="" />
    </AspectRatio>
    <AspectRatio>
      <div>Square</div>
    </AspectRatio>
  </>
);
