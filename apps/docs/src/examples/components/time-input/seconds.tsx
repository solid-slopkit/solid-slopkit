import { TimeInput } from '@solid-slopkit/components/dates';

export default function Seconds() {
  return <TimeInput label="Lap time" withSeconds defaultValue="00:01:42" variant="soft" style={{ 'max-width': '14rem' }} />;
}
