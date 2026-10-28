import { TimePicker } from '@solid-slopkit/components/dates';

export default function Seconds() {
  return <TimePicker label="Lap time" format="24h" withSeconds defaultValue="00:01:42" style={{ 'max-width': '14rem' }} />;
}
