import { createSignal } from 'solid-js';
import { JsonInput, Text } from '@solid-slopkit/components';

export default function Basic() {
  const [config, setConfig] = createSignal('{"theme":"dark","features":["search","export"]}');
  const keys = () => {
    try {
      return Object.keys(JSON.parse(config())).join(', ');
    } catch {
      return 'not valid yet';
    }
  };

  return (
    <div style={{ width: '100%', 'max-width': '28rem' }}>
      <JsonInput
        label="Config"
        description="Leave the field to check and format it."
        formatOnBlur
        autosize
        minRows={4}
        maxRows={12}
        value={config()}
        onChange={setConfig}
      />
      <Text size="sm" dimmed style={{ 'margin-top': '0.5rem' }}>
        Keys: {keys()}
      </Text>
    </div>
  );
}
