import { For } from 'solid-js';
import { Table } from '@solid-slopkit/components';

const elements = [
  { position: 6, name: 'Carbon', symbol: 'C', mass: 12.011 },
  { position: 7, name: 'Nitrogen', symbol: 'N', mass: 14.007 },
  { position: 39, name: 'Yttrium', symbol: 'Y', mass: 88.906 },
  { position: 56, name: 'Barium', symbol: 'Ba', mass: 137.33 },
  { position: 58, name: 'Cerium', symbol: 'Ce', mass: 140.12 },
];

export default function Basic() {
  return (
    <Table>
      <Table.Caption>Some chemical elements</Table.Caption>
      <Table.Thead>
        <Table.Tr>
          <Table.Th scope="col">Element</Table.Th>
          <Table.Th scope="col">Symbol</Table.Th>
          <Table.Th scope="col" style={{ 'text-align': 'end' }}>
            Atomic number
          </Table.Th>
          <Table.Th scope="col" style={{ 'text-align': 'end' }}>
            Atomic mass
          </Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        <For each={elements}>
          {(element) => (
            <Table.Tr>
              <Table.Th scope="row">{element.name}</Table.Th>
              <Table.Td>{element.symbol}</Table.Td>
              <Table.Td style={{ 'text-align': 'end' }}>{element.position}</Table.Td>
              <Table.Td style={{ 'text-align': 'end' }}>{element.mass}</Table.Td>
            </Table.Tr>
          )}
        </For>
      </Table.Tbody>
    </Table>
  );
}
