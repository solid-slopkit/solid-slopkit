import { createContext, createProjection, createSignal, omit, Show, untrack, useContext } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './dropzone.module.css';
import { callHandler, mergeDefaultProps, mergeRefs, type ElementProps, type Ref } from '../../../utils';
import { joinClass } from '../../../style-props';
import type { SlopColor } from '../../../core';
import { LoadingOverlay } from '../../overlays/loading-overlay';

/** Where a drag over the zone stands: nothing dragged, files it takes, or files it won't. */
export type DropzoneState = 'idle' | 'accept' | 'reject';

/** Why a file was rejected. A `validator` adds its own codes. */
export type DropzoneErrorCode = 'invalid-type' | 'too-large' | 'too-small' | 'too-many-files';

/** A file the zone didn't take, with every reason it didn't. */
export interface DropzoneRejection {
  file: File;
  errors: (DropzoneErrorCode | (string & {}))[];
}

export interface DropzoneOwnProps {
  /** Called with the files that pass every check, dropped or picked. Not called when none do. */
  onDrop: (files: File[]) => void;
  /** Called with the files that fail a check, and why. Not called when none do. */
  onReject?: (rejections: DropzoneRejection[]) => void;
  /** File types it takes, as in an input's `accept`: extensions or MIME types, e.g. `'image/*,.pdf'`. */
  accept?: string;
  /** Takes several files at once. Defaults to `true`; without it, a drop of several is rejected whole. */
  multiple?: boolean;
  /** At most this many files in one drop; more are rejected whole. */
  maxFiles?: number;
  /** Largest file it takes, in bytes. */
  maxSize?: number;
  /** Smallest file it takes, in bytes. */
  minSize?: number;
  /** Your own check: return an error code (or several) to reject the file, nothing to take it. */
  validator?: (file: File) => string | string[] | null | undefined;
  /** Opens the file picker on click, Enter and Space, and is a button for assistive tech. Defaults to `true`. Read once. */
  openOnClick?: boolean;
  /** Gets the function that opens the file picker, e.g. for a button inside a zone with `openOnClick={false}`. */
  openRef?: (open: () => void) => void;
  /** Takes no files and doesn't open the picker. */
  disabled?: boolean;
  /** Covers the zone with a loader and takes no files, e.g. while uploading. */
  loading?: boolean;
  /** The loader's accessible name. Defaults to `'Loading'`. */
  loadingLabel?: string;
  /** Color role of the zone while it would take the dragged files. Defaults to `primary`. */
  color?: SlopColor;
  /** The hidden file input. */
  inputRef?: Ref<HTMLInputElement>;
}

export type DropzoneProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, DropzoneOwnProps>;

/** Whether the zone is in a state; reading one state re-runs only when that state starts or ends. */
const DropzoneContext = createContext<((state: DropzoneState) => boolean) | null>(null);

const parseAccept = (accept: string | undefined) =>
  (accept ?? '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

const matchesType = (entry: string, type: string) =>
  entry.endsWith('/*') ? type.startsWith(entry.slice(0, -1)) : type === entry;

/** Whether a file passes `accept`, by its extension or its MIME type. */
const accepts = (entries: string[], file: File) => {
  if (entries.length === 0) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return entries.some((entry) => (entry.startsWith('.') ? name.endsWith(entry) : matchesType(entry, type)));
};

const hasFiles = (event: DragEvent) => !!event.dataTransfer && Array.from(event.dataTransfer.types).includes('Files');

/**
 * An area that takes files dropped on it, and opens the file picker when clicked. It checks the files against
 * `accept`, the sizes, the count and your `validator`, and hands the ones that pass to `onDrop`, the rest to
 * `onReject`. While files are dragged over, it shows whether it would take them: Dropzone.Accept, Dropzone.Reject and
 * Dropzone.Idle show their children in that state only.
 */
export function Dropzone(props: DropzoneProps) {
  const merged = mergeDefaultProps({ multiple: true, color: 'primary' as SlopColor }, props);
  const others = omit(
    merged,
    'class',
    'children',
    'onDrop',
    'onReject',
    'accept',
    'multiple',
    'maxFiles',
    'maxSize',
    'minSize',
    'validator',
    'openOnClick',
    'openRef',
    'disabled',
    'loading',
    'loadingLabel',
    'color',
    'inputRef',
    'onClick',
    'onKeyDown',
    'onDragEnter',
    'onDragOver',
    'onDragLeave',
    // `onDrop` is the files callback; the element's drop event isn't forwarded.
  );
  let input: HTMLInputElement | undefined;
  const openOnClick = untrack(() => props.openOnClick ?? true);

  const [state, setState] = createSignal<DropzoneState>('idle', { name: 'Dropzone.state' });
  // The state as a set of one key, so a change re-runs only what reads the old and the new state.
  let previous: DropzoneState = 'idle';
  const current = createProjection<Partial<Record<DropzoneState, true>>>(
    (draft) => {
      const next = state();
      delete draft[previous];
      draft[next] = true;
      previous = next;
    },
    { idle: true },
    { name: 'Dropzone.current' },
  );
  const is = (which: DropzoneState) => current[which] === true;
  // dragenter and dragleave fire for every child the pointer crosses: the drag is over the zone while this is above 0.
  let depth = 0;

  const inactive = () => !!(merged.disabled || merged.loading);

  const open = () => {
    if (!inactive()) input?.click();
  };
  untrack(() => props.openRef)?.(open);

  /** The drag's verdict from what the browser tells before the drop: the count, and the MIME types it knows. */
  const verdict = (event: DragEvent): DropzoneState => {
    const items = Array.from(event.dataTransfer?.items ?? []).filter((item) => item.kind === 'file');
    if (items.length > 1 && !merged.multiple) return 'reject';
    if (merged.maxFiles !== undefined && items.length > merged.maxFiles) return 'reject';
    const entries = parseAccept(merged.accept);
    if (entries.length === 0) return 'accept';
    // An extension can't be checked before the drop: with one in `accept`, any type might pass.
    const byExtension = entries.some((entry) => entry.startsWith('.'));
    const known = items.map((item) => item.type.toLowerCase()).filter(Boolean);
    const passes = known.every((type) => byExtension || entries.some((entry) => matchesType(entry, type)));
    return passes ? 'accept' : 'reject';
  };

  const take = (files: File[]) => {
    if (files.length === 0) return;
    const entries = parseAccept(merged.accept);
    const tooMany = (files.length > 1 && !merged.multiple) || (merged.maxFiles !== undefined && files.length > merged.maxFiles);
    const accepted: File[] = [];
    const rejections: DropzoneRejection[] = [];
    for (const file of files) {
      const errors: string[] = [];
      if (!accepts(entries, file)) errors.push('invalid-type');
      if (merged.maxSize !== undefined && file.size > merged.maxSize) errors.push('too-large');
      if (merged.minSize !== undefined && file.size < merged.minSize) errors.push('too-small');
      if (tooMany) errors.push('too-many-files');
      const own = merged.validator?.(file);
      if (own) errors.push(...(Array.isArray(own) ? own : [own]));
      if (errors.length) rejections.push({ file, errors });
      else accepted.push(file);
    }
    if (accepted.length) merged.onDrop(accepted);
    if (rejections.length) merged.onReject?.(rejections);
  };

  const onDragEnter = (event: DragEvent) => {
    callHandler(props.onDragEnter, event);
    if (!hasFiles(event)) return;
    event.preventDefault();
    depth += 1;
    if (depth === 1 && !inactive()) setState(verdict(event));
  };

  const onDragOver = (event: DragEvent) => {
    callHandler(props.onDragOver, event);
    if (!hasFiles(event)) return;
    // Taking over dragover is what lets the drop happen, and keeps the browser from opening the file instead.
    event.preventDefault();
    event.dataTransfer!.dropEffect = inactive() ? 'none' : 'copy';
  };

  const onDragLeave = (event: DragEvent) => {
    callHandler(props.onDragLeave, event);
    if (!hasFiles(event) || depth === 0) return;
    depth -= 1;
    if (depth === 0) setState('idle');
  };

  const onDropEvent = (event: DragEvent) => {
    if (!hasFiles(event)) return;
    event.preventDefault();
    depth = 0;
    setState('idle');
    if (!inactive()) take(Array.from(event.dataTransfer?.files ?? []));
  };

  const onClick = (event: MouseEvent) => {
    callHandler(props.onClick, event);
    // The picker's own click bubbles up here too.
    if (!openOnClick || event.defaultPrevented || event.target === input) return;
    open();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    callHandler(props.onKeyDown, event);
    if (!openOnClick || event.defaultPrevented || event.target !== event.currentTarget) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    open();
  };

  const onInputChange = (event: Event) => {
    const target = event.currentTarget as HTMLInputElement;
    const files = Array.from(target.files ?? []);
    // Cleared, so picking the same file again is a change too.
    target.value = '';
    take(files);
  };

  return (
    <div
      role={openOnClick ? 'button' : undefined}
      tabindex={openOnClick ? (merged.disabled ? -1 : 0) : undefined}
      aria-disabled={openOnClick && merged.disabled ? 'true' : undefined}
      aria-busy={merged.loading ? 'true' : undefined}
      data-color={merged.color}
      data-accept={is('accept') ? '' : undefined}
      data-reject={is('reject') ? '' : undefined}
      data-disabled={merged.disabled ? '' : undefined}
      data-loading={merged.loading ? '' : undefined}
      class={joinClass(['slp-dropzone', style.dropzone], merged.class)}
      {...others}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDropEvent}
    >
      <DropzoneContext value={is}>{merged.children}</DropzoneContext>
      <input
        ref={mergeRefs((el: HTMLInputElement) => (input = el), untrack(() => props.inputRef) as Ref<HTMLInputElement>)}
        type="file"
        hidden
        tabindex={-1}
        data-slot="dropzone-input"
        accept={merged.accept}
        multiple={merged.multiple}
        disabled={inactive()}
        onChange={onInputChange}
      />
      <LoadingOverlay visible={!!merged.loading} label={merged.loadingLabel} data-slot="dropzone-loader" />
    </div>
  );
}

function useDropzoneState(component: string) {
  const is = useContext(DropzoneContext);
  if (!is) throw new Error(`<${component}> must be rendered inside <Dropzone>.`);
  return is;
}

export interface DropzoneStatusProps {
  children?: JSX.Element;
}

/** Shows its children while the dragged files would be taken. */
export function DropzoneAccept(props: DropzoneStatusProps) {
  const is = useDropzoneState('Dropzone.Accept');
  return <Show when={is('accept')}>{props.children}</Show>;
}

/** Shows its children while the dragged files would be rejected. */
export function DropzoneReject(props: DropzoneStatusProps) {
  const is = useDropzoneState('Dropzone.Reject');
  return <Show when={is('reject')}>{props.children}</Show>;
}

/** Shows its children while nothing is dragged over the zone. */
export function DropzoneIdle(props: DropzoneStatusProps) {
  const is = useDropzoneState('Dropzone.Idle');
  return <Show when={is('idle')}>{props.children}</Show>;
}

Dropzone.Accept = DropzoneAccept;
Dropzone.Reject = DropzoneReject;
Dropzone.Idle = DropzoneIdle;
