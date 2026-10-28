import { onSettled } from 'solid-js';
import { useNavigate } from '@solidjs/router';

// The overview lives at /flow/overview, so the sidebar's link to it isn't a parent of every flow page, which the router
// would mark as current on each of them. Links to /flow still land on it.
export default function FlowIndex() {
  const navigate = useNavigate();
  onSettled(() => navigate('/flow/overview', { replace: true }));
  return null;
}
