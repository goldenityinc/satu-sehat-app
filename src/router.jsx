import { createContext, useContext, useEffect, useState } from 'react';

// Router hash minimal: #/kunjungan/k3 → { path: '/kunjungan/k3', parts: ['kunjungan', 'k3'] }
const read = () => {
  const path = window.location.hash.replace(/^#/, '') || '/';
  return { path, parts: path.split('/').filter(Boolean) };
};

const RouterCtx = createContext(read());

export function RouterProvider({ children }) {
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const onHash = () => {
      setRoute(read());
      document.querySelector('.screen')?.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return <RouterCtx.Provider value={route}>{children}</RouterCtx.Provider>;
}

export const useRoute = () => useContext(RouterCtx);
export const navigate = (path) => { window.location.hash = path; };
export const back = (fallback = '/') => {
  if (window.history.length > 1) window.history.back();
  else navigate(fallback);
};

export function Link({ to, children, ...rest }) {
  return <a href={'#' + to} {...rest}>{children}</a>;
}
