import { NativeSelect } from '@solid-slopkit/components';

export default function Basic() {
  return (
    <NativeSelect
      label="Editor"
      description="The one you write code in most."
      data={['Vim', 'Emacs', { value: 'other', label: 'Something else' }]}
      style={{ width: '100%', 'max-width': '20rem' }}
    />
  );
}
