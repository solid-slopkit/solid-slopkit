import { Avatar } from '@solid-slopkit/components';
import landscape from '../example-landscape.svg';

export default function Basic() {
  return (
    <>
      <Avatar src={landscape} name="Sunset Hills" />
      <Avatar name="Grace Hopper" color="primary" />
      <Avatar src="/missing-photo.jpg" name="Ada Lovelace" color="secondary" />
      <Avatar />
    </>
  );
}
