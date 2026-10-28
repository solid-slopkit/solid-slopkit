// SSR scenarios for card.test.tsx.
import { Card } from '.';

const IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'/%3E";

export const parts = () => (
  <div>
    <Card class="mine">
      <Card.Image src={IMAGE} alt="Cover" />
      <Card.Header>
        <h3>Title</h3>
        <span>New</span>
      </Card.Header>
      <Card.Body>Body</Card.Body>
      <Card.Footer>
        <button type="button">Action</button>
      </Card.Footer>
    </Card>
    <Card size="sm">
      <Card.Header>
        <Card.Title>Payout</Card.Title>
        <Card.Description>Set the minimum balance.</Card.Description>
        <button type="button">Close</button>
      </Card.Header>
    </Card>
    <Card variant="soft" orientation="horizontal">
      <Card.Image src={IMAGE} alt="" />
      <Card.Body>Side</Card.Body>
    </Card>
  </div>
);
