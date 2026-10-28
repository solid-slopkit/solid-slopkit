// SSR scenarios for table.test.tsx.
import { For } from 'solid-js';
import { Table } from '.';

const rows = [
  { name: 'Ada', role: 'Engineer' },
  { name: 'Grace', role: 'Admiral' },
];

export const tables = () => (
  <Table.ScrollContainer>
    <Table class="mine" striped hover bordered size="sm">
      <Table.Caption>Team</Table.Caption>
      <Table.Thead>
        <Table.Tr>
          <Table.Th scope="col">Name</Table.Th>
          <Table.Th scope="col">Role</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        <For each={rows}>
          {(row) => (
            <Table.Tr>
              <Table.Th scope="row">{row.name}</Table.Th>
              <Table.Td>{row.role}</Table.Td>
            </Table.Tr>
          )}
        </For>
      </Table.Tbody>
    </Table>
  </Table.ScrollContainer>
);
