// SSR scenarios for combobox.test.tsx.
import { Combobox, createCombobox } from '.';

export const comboboxes = () => {
  const closed = createCombobox();
  const opened = createCombobox({ defaultOpened: true });
  return (
    <div>
      <Combobox store={closed}>
        <Combobox.Target>{(target) => <input {...target} aria-label="Closed" />}</Combobox.Target>
        <Combobox.Dropdown>
          <Combobox.Options aria-label="Closed options">
            <Combobox.Option value="a">A</Combobox.Option>
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
      <Combobox store={opened}>
        <Combobox.Target>{(target) => <button {...target}>Opened</button>}</Combobox.Target>
        <Combobox.Dropdown class="mine">
          <Combobox.Options aria-label="Opened options">
            <Combobox.Group label="Letters">
              <Combobox.Option value="a" selected>
                A
              </Combobox.Option>
              <Combobox.Option value="b" disabled>
                B
              </Combobox.Option>
            </Combobox.Group>
          </Combobox.Options>
          <Combobox.Empty>Nothing</Combobox.Empty>
        </Combobox.Dropdown>
      </Combobox>
    </div>
  );
};
