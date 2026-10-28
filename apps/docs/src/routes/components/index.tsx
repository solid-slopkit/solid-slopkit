import { onSettled } from 'solid-js';
import { useNavigate } from '@solidjs/router';

// The overview lives at /components/overview, so the sidebar's link to it isn't a parent of every component page, which
// the router would mark as current on each of them. Links to /components still land on it.
export default function ComponentsIndex() {
  const navigate = useNavigate();
  onSettled(() => navigate('/components/overview', { replace: true }));
  return null;
}
