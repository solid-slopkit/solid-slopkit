import { Eraser } from '@lucide/solid';
import { CloseButton } from '@solid-slopkit/components';

export default function Icon() {
  return (
    <CloseButton label="Clear search">
      <Eraser aria-hidden="true" />
    </CloseButton>
  );
}
