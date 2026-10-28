export const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
export type SlopSize = (typeof SIZES)[number];

export type SlopColor = 'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error';
