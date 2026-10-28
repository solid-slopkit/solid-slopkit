import { FileInput } from '@solid-slopkit/components';

export default function Multiple() {
  return (
    <FileInput
      label="Photos"
      multiple
      accept="image/*"
      clearable
      variant="soft"
      valueFormat={(files) => (files.length === 1 ? files[0].name : `${files.length} photos`)}
      style={{ width: '100%', 'max-width': '22rem' }}
    />
  );
}
