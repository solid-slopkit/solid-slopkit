import { onSettled } from 'solid-js';
import { useNavigate } from '@solidjs/router';

// The overview lives at /i18n/overview, so the sidebar's link to it isn't a parent of every i18n page, which the router
// would mark as current on each of them. Links to /i18n still land on it.
export default function I18nIndex() {
  const navigate = useNavigate();
  onSettled(() => navigate('/i18n/overview', { replace: true }));
  return null;
}
