// TEMPORARY: diagnoses "Shift-click adds to the Selection; the selected Nodes drag together" failing on Linux CI only.
// Logs every pointer event the page sees, and runs variants that each rule one cause in or out. Delete before merging.
import { describe, expect, test } from 'vitest';

import { renderEditor } from '../../test/editor';
import { drag, mouse, pointOf, settle, SHIFT } from '../../test/input';
import type { FlowNode, FlowState } from '../model/model';
import { Port } from '../port/Port';

const CTRL = 2;

const node = (id: string, x: number, y = 0): FlowNode => ({ id, position: { x, y }, data: null });
const content = () => (
  <div style={{ width: '100px', height: '50px' }}>
    <Port id="in" side="left" />
    <Port id="out" side="right" />
  </div>
);
const state: FlowState = {
  nodes: [node('a', 0), node('b', 300), node('c', 300, 200)],
  edges: [{ id: 'ab', source: { node: 'a', port: 'out' }, target: { node: 'b', port: 'in' }, shape: 'straight', data: null }],
};

const all: string[] = [];

const TYPES = ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'gotpointercapture', 'lostpointercapture', 'click'];

async function setup(label: string) {
  const log: string[] = [];
  const t0 = performance.now();
  const listener = (event: Event) => {
    const e = event as PointerEvent;
    const target = event.target instanceof Element ? event.target : undefined;
    const where = target?.closest('[data-flow-node]')?.getAttribute('data-flow-node') ?? target?.tagName ?? '?';
    log.push(
      `${Math.round(performance.now() - t0)}ms ${e.type} id=${e.pointerId} type=${e.pointerType} btn=${e.button} btns=${e.buttons} shift=${e.shiftKey} ctrl=${e.ctrlKey} detail=${e.detail} at=${e.clientX},${e.clientY} on=${where}`,
    );
  };
  for (const type of TYPES) document.addEventListener(type, listener, true);
  const editor = renderEditor(state, {
    content,
    flow: { createId: () => 'n', defaultViewport: { x: 40, y: 40, zoom: 1 } },
  });
  await settle();
  const selected = () => editor.state.nodes.filter((record) => record.selected).map((record) => record.id);
  const report = () => {
    for (const type of TYPES) document.removeEventListener(type, listener, true);
    all.push(
      [
        `===== ${label} (${navigator.userAgent})`,
        ...log,
        `selected: ${JSON.stringify(selected())}`,
        `positions: ${JSON.stringify(editor.state.nodes.map((record) => record.position))}`,
        `batches: ${JSON.stringify(editor.batches.map((batch) => batch.changes.map((change) => change.type)))}`,
      ].join('\n'),
    );
  };
  return { ...editor, selected, report };
}

const moved = (positions: { x: number; y: number }[]) => positions[1]!.x !== 300 || positions[1]!.y !== 0;

describe('debug: Shift-click then drag', () => {
  test('1. as the failing test does it', async () => {
    const { nodeElement, report, state: flow } = await setup('1. original');
    await drag(pointOf(nodeElement('a')));
    const b = pointOf(nodeElement('b'));
    await mouse('mousePressed', b, { modifiers: SHIFT });
    await mouse('mouseReleased', b, { modifiers: SHIFT });
    await settle();
    await drag(b, { x: b.x + 20, y: b.y + 10 }, { x: b.x + 40, y: b.y + 30 });
    report();
    expect(moved(flow.nodes.map((record) => record.position))).toBe(true);
  });

  test('2. a pause past the double-click time before the drag', async () => {
    const { nodeElement, report, state: flow } = await setup('2. pause');
    await drag(pointOf(nodeElement('a')));
    const b = pointOf(nodeElement('b'));
    await mouse('mousePressed', b, { modifiers: SHIFT });
    await mouse('mouseReleased', b, { modifiers: SHIFT });
    await new Promise((resolve) => setTimeout(resolve, 800));
    await drag(b, { x: b.x + 20, y: b.y + 10 }, { x: b.x + 40, y: b.y + 30 });
    report();
    expect(moved(flow.nodes.map((record) => record.position))).toBe(true);
  });

  test('3. the drag starts a few pixels away from the Shift-click', async () => {
    const { nodeElement, report, state: flow } = await setup('3. offset');
    await drag(pointOf(nodeElement('a')));
    const b = pointOf(nodeElement('b'));
    await mouse('mousePressed', b, { modifiers: SHIFT });
    await mouse('mouseReleased', b, { modifiers: SHIFT });
    await settle();
    const from = { x: b.x - 10, y: b.y - 5 };
    await drag(from, { x: from.x + 20, y: from.y + 10 }, { x: from.x + 40, y: from.y + 30 });
    report();
    expect(moved(flow.nodes.map((record) => record.position))).toBe(true);
  });

  test('4. Ctrl instead of Shift', async () => {
    const { nodeElement, report, state: flow } = await setup('4. ctrl');
    await drag(pointOf(nodeElement('a')));
    const b = pointOf(nodeElement('b'));
    await mouse('mousePressed', b, { modifiers: CTRL });
    await mouse('mouseReleased', b, { modifiers: CTRL });
    await settle();
    await drag(b, { x: b.x + 20, y: b.y + 10 }, { x: b.x + 40, y: b.y + 30 });
    report();
    expect(moved(flow.nodes.map((record) => record.position))).toBe(true);
  });

  test('5. a plain click on b, then the drag (no modifier)', async () => {
    const { nodeElement, report, state: flow } = await setup('5. plain click');
    const b = pointOf(nodeElement('b'));
    await drag(b);
    await drag(b, { x: b.x + 20, y: b.y + 10 }, { x: b.x + 40, y: b.y + 30 });
    report();
    expect(moved(flow.nodes.map((record) => record.position))).toBe(true);
  });

  // Runs last and always fails, so every variant's log shows in the output whichever ones pass.
  test('6. dump the logs', () => {
    throw new Error(`\n${all.join('\n\n')}`);
  });
});
