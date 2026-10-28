import { Button, notifications } from '@solid-slopkit/components';

// Outside any component, such as in the app's fetch helper.
async function request(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return response;
  } catch (error) {
    notifications.show({ title: 'Request failed', message: String(error), color: 'error', role: 'alert' });
  }
}

export default function Facade() {
  return (
    <Button variant="outline" onClick={() => request('/api/missing')}>
      Fetch something that isn't there
    </Button>
  );
}
