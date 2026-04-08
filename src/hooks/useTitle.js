import { useEffect } from 'react';

export function useTitle(titulo) {
  useEffect(() => {
    document.title = titulo ? `${titulo} — Reservly` : 'Reservly';
    return () => { document.title = 'Reservly'; };
  }, [titulo]);
}