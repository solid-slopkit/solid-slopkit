// jest-dom matchers (toHaveAttribute, toHaveTextContent, …) and the
// @solidjs/diagnostics matchers (toHaveNoDiagnostics, toStayWithinRerunBudget, …).
import '@testing-library/jest-dom/vitest';
import '@solidjs/diagnostics/vitest';

import { cleanup } from '@solidjs/testing-library';
import { afterEach } from 'vitest';

// Unmounts what each test rendered, so a provider does not outlive its test.
afterEach(cleanup);
