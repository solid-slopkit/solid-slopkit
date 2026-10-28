import { Avatar, Indicator } from '@solid-slopkit/components';

export default function AvatarStatus() {
  return (
    <>
      <Indicator position="bottom-end" color="success" offset={5}>
        <Avatar name="Grace Hopper" color="primary" size="lg" alt="Grace Hopper, online" />
      </Indicator>
      <Indicator position="bottom-end" color="warning" offset={5} processing>
        <Avatar name="Alan Turing" color="secondary" size="lg" alt="Alan Turing, connecting" />
      </Indicator>
      <Indicator position="top-end" color="error" offset={5} label="2" size="sm">
        <Avatar name="Ada Lovelace" size="lg" alt="Ada Lovelace, 2 new messages" />
      </Indicator>
    </>
  );
}
