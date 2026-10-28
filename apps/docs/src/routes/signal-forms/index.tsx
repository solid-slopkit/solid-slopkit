import { onSettled } from 'solid-js';
import { useNavigate } from '@solidjs/router';

// The overview lives at /signal-forms/overview, so the sidebar's link to it isn't a parent of every signal-forms page, which the router
// would mark as current on each of them. Links to /signal-forms still land on it.
export default function SignalFormsIndex() {
  const navigate = useNavigate();
  onSettled(() => navigate('/signal-forms/overview', { replace: true }));
  return null;
}
