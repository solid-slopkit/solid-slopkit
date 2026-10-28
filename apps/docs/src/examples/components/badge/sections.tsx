import { Badge } from '@solid-slopkit/components';
import { Check, Clock, Star } from '@lucide/solid';

export default function Sections() {
  return (
    <>
      <Badge color="success" variant="soft" leftSection={<Check aria-hidden="true" />}>
        Verified
      </Badge>
      <Badge color="warning" variant="outline" leftSection={<Clock aria-hidden="true" />}>
        Pending
      </Badge>
      <Badge size="lg" rightSection={<Star aria-hidden="true" />}>
        Featured
      </Badge>
    </>
  );
}
