import { createSignal } from 'solid-js';
import { Button } from '@solid-slopkit/components';

export default function Loading() {
  const [saving, setSaving] = createSignal(false);

  const save = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 2000);
  };

  return (
    <>
      <Button color="primary" loading={saving()} onClick={save}>
        Save
      </Button>
      <Button loading>Loading</Button>
      <Button color="primary" variant="outline" loading>
        Loading
      </Button>
    </>
  );
}
