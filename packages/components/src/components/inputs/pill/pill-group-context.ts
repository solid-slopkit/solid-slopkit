// The size, color and disabled state pills take from what they're in: Pill.Group, or a PillsInput. Internal; not
// exported from the package.
import { createContext } from 'solid-js';
import type { SlopColor, SlopSize } from '../../../core';

export interface PillGroupContextValue {
  size: () => SlopSize | undefined;
  color: () => SlopColor | undefined;
  disabled: () => boolean;
}

export const PillGroupContext = createContext<PillGroupContextValue | null>(null);
