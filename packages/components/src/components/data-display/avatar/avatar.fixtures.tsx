// SSR scenarios for avatar.test.tsx.
import { Avatar } from '.';

const pixel = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

export const avatars = () => (
  <div>
    <Avatar class="mine" src={pixel} alt="Ada Lovelace" />
    <Avatar name="Grace Hopper" color="primary" size="lg" />
    <Avatar variant="solid" color="success" alt="Three more">
      +3
    </Avatar>
    <Avatar />
    <Avatar.Group>
      <Avatar name="Alan Turing" />
      <Avatar name="Edsger Dijkstra" variant="outline" />
    </Avatar.Group>
  </div>
);
