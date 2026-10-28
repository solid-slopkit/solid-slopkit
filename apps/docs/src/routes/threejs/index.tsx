import { onSettled } from 'solid-js';
import { useNavigate } from '@solidjs/router';

// The overview lives at /threejs/overview, so the sidebar's link to it isn't a parent of every threejs page, which the router
// would mark as current on each of them. Links to /threejs still land on it.
export default function ThreejsIndex() {
  const navigate = useNavigate();
  onSettled(() => navigate('/threejs/overview', { replace: true }));
  return null;
}
