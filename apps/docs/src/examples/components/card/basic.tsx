import { Badge, Button, Card, Text } from '@solid-slopkit/components';
import landscape from '../example-landscape.svg';

export default function Basic() {
  return (
    <Card style={{ width: '20rem' }}>
      <Card.Image src={landscape} alt="Mountains at sunset" style={{ height: '10rem' }} />
      <Card.Header>
        <Card.Title>Norway</Card.Title>
        <Card.Description>Fjords, mountains and the midnight sun.</Card.Description>
        <Badge size="sm" variant="soft" color="success">
          New
        </Badge>
      </Card.Header>
      <Card.Body>
        <Text size="sm">Ten days along the coast, from Bergen to the Lofoten islands by train, ferry and on foot.</Text>
      </Card.Body>
      <Card.Footer>
        <Button variant="ghost" size="sm">
          Details
        </Button>
        <Button color="primary" size="sm">
          Book
        </Button>
      </Card.Footer>
    </Card>
  );
}
