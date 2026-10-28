import { Image } from '@solid-slopkit/components';
import placeholder from '../example-placeholder.svg';

export default function Fallback() {
  return (
    <Image
      src="/missing-photo.jpg"
      fallbackSrc={placeholder}
      alt="Product photo"
      width={240}
      height={160}
      style={{ 'border-radius': '8px' }}
    />
  );
}
