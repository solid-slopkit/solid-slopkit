// SSR scenarios for native-select.test.tsx.
import { NativeSelect } from '.';

export const nativeSelects = () => (
  <div>
    <NativeSelect label="Framework" data={['Solid', 'Svelte', { value: 'vue', label: 'Vue', disabled: true }]} class="mine" />
    <NativeSelect
      label="Country"
      placeholder="Pick one"
      value=""
      data={[
        { group: 'Europe', items: ['France', 'Germany'] },
        { group: 'Asia', items: ['Japan'] },
      ]}
    />
    <NativeSelect label="Size" variant="soft" disabled>
      <option value="s">Small</option>
      <option value="m">Medium</option>
    </NativeSelect>
  </div>
);
