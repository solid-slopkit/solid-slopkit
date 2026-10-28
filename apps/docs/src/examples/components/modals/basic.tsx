import { Button, TextInput, useModals } from '@solid-slopkit/components';

export default function Basic() {
  const modals = useModals();

  const open = () => {
    const id = modals.open({
      title: 'Rename project',
      // A function, so the form renders inside the modal, under the provider.
      children: () => (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            modals.close(id);
          }}
        >
          <TextInput label="Name" value="slopkit" data-autofocus />
          <Button type="submit" fullWidth style={{ 'margin-top': '1rem' }}>
            Save
          </Button>
        </form>
      ),
    });
  };

  return <Button onClick={open}>Rename</Button>;
}
