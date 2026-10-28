import { Button, useNotifications } from '@solid-slopkit/components';

export default function Update() {
  const notifications = useNotifications();

  const upload = () => {
    const id = notifications.show({ title: 'Uploading', message: '3 files', loading: true, withCloseButton: false });
    setTimeout(() => {
      notifications.update(id, {
        title: 'Uploaded',
        message: '3 files are in the project.',
        loading: false,
        color: 'success',
        withCloseButton: true,
        autoClose: 3000,
      });
    }, 2000);
  };

  return <Button onClick={upload}>Upload</Button>;
}
