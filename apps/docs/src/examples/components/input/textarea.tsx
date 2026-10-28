import { Input } from '@solid-slopkit/components';

export default function Textarea() {
  return <Input as="textarea" aria-label="Notes" placeholder="Notes" rows={3} style={{ width: '100%', 'max-width': '20rem' }} />;
}
