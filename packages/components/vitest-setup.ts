// Registers @testing-library/jest-dom's matchers (toHaveTextContent etc.)
// with vitest's expect, including their types.
import '@testing-library/jest-dom/vitest';
import '@solidjs/diagnostics/vitest';
import { cleanup } from '@solidjs/testing-library';
import { afterEach } from 'vitest';

// With `globals: false`, @solidjs/testing-library can't register its own cleanup, so rendered trees would
// pile up across a file's tests.
afterEach(cleanup);
