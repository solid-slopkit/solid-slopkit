import { CreditCard, MapPin, ShieldCheck, User } from '@lucide/solid';
import { Stepper } from '@solid-slopkit/components';

export default function Icons() {
  return (
    <Stepper active={2} color="success" size="sm">
      <Stepper.Step label="Account" icon={<User />} completedIcon={<ShieldCheck />} />
      <Stepper.Step label="Address" icon={<MapPin />} completedIcon={<ShieldCheck />} />
      <Stepper.Step label="Payment" icon={<CreditCard />} loading description="Checking your card" />
    </Stepper>
  );
}
