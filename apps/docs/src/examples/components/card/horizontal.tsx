import { Button, Card, Text } from '@solid-slopkit/components';
import landscape from '../example-landscape.svg';

export default function Horizontal() {
  return (
    <Card orientation="horizontal" style={{ 'max-width': '32rem' }}>
      <Card.Image src={landscape} alt="Mountains at sunset" />
      <Card.Header>
        <Card.Title>Norway</Card.Title>
      </Card.Header>
      <Card.Body>
        <Text size="sm" dimmed>
          The image fills a column on the start side, as tall as the parts beside it.
        </Text>
      </Card.Body>
      <Card.Footer>
        <Button color="primary" size="sm">
          Book
        </Button>
      </Card.Footer>
    </Card>
  );
}
