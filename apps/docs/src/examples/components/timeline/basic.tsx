import { Timeline } from '@solid-slopkit/components';
import { House, PackageCheck, ShoppingCart, Truck } from '@lucide/solid';

export default function Basic() {
  return (
    <Timeline>
      <Timeline.Item active title="Ordered" bullet={<ShoppingCart aria-hidden="true" />}>
        Monday, 9:40
      </Timeline.Item>
      <Timeline.Item active title="Packed" bullet={<PackageCheck aria-hidden="true" />}>
        Monday, 16:12
      </Timeline.Item>
      <Timeline.Item active title="Shipped" bullet={<Truck aria-hidden="true" />}>
        Tuesday, 14:05
      </Timeline.Item>
      <Timeline.Item title="Delivered" bullet={<House aria-hidden="true" />}>
        Expected Friday
      </Timeline.Item>
    </Timeline>
  );
}
