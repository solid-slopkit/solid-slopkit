import { Textarea } from '@solid-slopkit/components';

export default function Basic() {
  return (
    <Textarea
      label="Notes"
      description="Anything the courier should know."
      rows={4}
      placeholder="Leave it at the door"
      style={{ width: '100%', 'max-width': '24rem' }}
    />
  );
}
