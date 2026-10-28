import { createStore } from 'solid-js';
import { Code, Stack } from '@solid-slopkit/components';
import { control, form } from '@solid-slopkit/signal-forms';

export default function NativeControl() {
  const [model, setModel] = createStore({ name: 'Ada', age: 36, agree: false, color: 'green' });
  const f = form(model, setModel);

  return (
    <Stack gap={2} style={{ 'max-width': '20rem' }}>
      <label>
        Name <input {...control(f.name)} />
      </label>
      <label>
        Age <input type="number" {...control.number(f.age)} />
      </label>
      <label>
        <input type="checkbox" {...control.checkbox(f.agree)} /> Agree
      </label>
      <label>
        Color{' '}
        <select {...control.select(f.color)}>
          <option value="red">red</option>
          <option value="green">green</option>
        </select>
      </label>
      <Code block>{JSON.stringify(model, null, 2)}</Code>
    </Stack>
  );
}
