import { createSignal } from 'solid-js';
import { FileText } from '@lucide/solid';
import { FileInput, Text } from '@solid-slopkit/components';

export default function Basic() {
  const [resume, setResume] = createSignal<File | null>(null);

  return (
    <div style={{ width: '100%', 'max-width': '22rem' }}>
      <FileInput
        label="Resume"
        description="PDF, up to 5 MB."
        accept=".pdf"
        clearable
        leftSection={<FileText aria-hidden="true" />}
        value={resume()}
        onChange={setResume}
      />
      <Text size="sm" dimmed style={{ 'margin-top': '0.5rem' }}>
        {resume() ? `${resume()!.name}, ${Math.ceil(resume()!.size / 1024)} KB` : 'Nothing chosen.'}
      </Text>
    </div>
  );
}
