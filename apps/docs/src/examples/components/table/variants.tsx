import { For } from 'solid-js';
import { Table } from '@solid-slopkit/components';

const people = [
  { name: 'Ada Lovelace', role: 'Analyst', team: 'Engines' },
  { name: 'Grace Hopper', role: 'Admiral', team: 'Compilers' },
  { name: 'Alan Turing', role: 'Mathematician', team: 'Machines' },
  { name: 'Barbara Liskov', role: 'Professor', team: 'Abstractions' },
];

export default function Variants() {
  return (
    <Table striped hover bordered size="sm" aria-label="Team">
      <Table.Thead>
        <Table.Tr>
          <Table.Th scope="col">Name</Table.Th>
          <Table.Th scope="col">Role</Table.Th>
          <Table.Th scope="col">Team</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        <For each={people}>
          {(person) => (
            <Table.Tr>
              <Table.Th scope="row">{person.name}</Table.Th>
              <Table.Td>{person.role}</Table.Td>
              <Table.Td>{person.team}</Table.Td>
            </Table.Tr>
          )}
        </For>
      </Table.Tbody>
      <Table.Tfoot>
        <Table.Tr>
          <Table.Th scope="row">Total</Table.Th>
          <Table.Td colspan={2}>{people.length} people</Table.Td>
        </Table.Tr>
      </Table.Tfoot>
    </Table>
  );
}
