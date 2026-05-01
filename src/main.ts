import './styles.css';
import { renderRoute } from './router';

renderRoute();
window.addEventListener('popstate', renderRoute);
document.addEventListener('click', (event) => {
  const link = (event.target as HTMLElement).closest('a[data-link]') as HTMLAnchorElement | null;
  if (!link || link.origin !== window.location.origin) return;
  event.preventDefault();
  history.pushState({}, '', link.href);
  renderRoute();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
