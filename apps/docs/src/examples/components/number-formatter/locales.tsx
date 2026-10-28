import { For } from 'solid-js';
import { NumberFormatter, SlopkitUi, Table } from '@solid-slopkit/components';

const locales = ['en-US', 'de-DE', 'fr-FR', 'hi-IN', 'ja-JP'];

export default function Locales() {
  return (
    <Table size="sm" aria-label="One price in several locales">
      <Table.Thead>
        <Table.Tr>
          <Table.Th scope="col">Locale</Table.Th>
          <Table.Th scope="col" style={{ 'text-align': 'end' }}>
            1234567.89 in euros
          </Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        <For each={locales}>
          {(locale) => (
            <Table.Tr>
              <Table.Th scope="row">{locale}</Table.Th>
              <Table.Td style={{ 'text-align': 'end' }}>
                {/* A nested provider sets the locale for everything inside it. */}
                <SlopkitUi locale={locale}>
                  <NumberFormatter value={1234567.89} options={{ style: 'currency', currency: 'EUR' }} />
                </SlopkitUi>
              </Table.Td>
            </Table.Tr>
          )}
        </For>
      </Table.Tbody>
    </Table>
  );
}
