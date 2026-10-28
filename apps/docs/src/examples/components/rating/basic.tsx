import { createSignal } from 'solid-js';
import { Rating, Text } from '@solid-slopkit/components';

export default function Basic() {
  const [rating, setRating] = createSignal(3);

  return (
    <div>
      <Rating
        label="Your rating"
        description="Click the current star again to clear it."
        value={rating()}
        onChange={setRating}
        allowClear
      />
      <Text size="sm" dimmed style={{ 'margin-top': '0.5rem' }}>
        Value: {rating()}
      </Text>
    </div>
  );
}
