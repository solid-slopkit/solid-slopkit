import { Image } from '@solid-slopkit/components';
import landscape from '../example-landscape.svg';

export default function Basic() {
  return <Image src={landscape} alt="Mountains at sunset" style={{ 'border-radius': '8px' }} />;
}
