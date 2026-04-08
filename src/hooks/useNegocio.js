import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export function useNegocio() {
  const [negocio, setNegocio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchNegocio = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (mounted) { setLoading(false); }
          return;
        }

        const { data, error } = await supabase
          .from('negocios')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (mounted) {
          if (error) setError(error);
          else setNegocio(data);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      }
    };

    fetchNegocio();
    return () => { mounted = false; };
  }, []);

  return { negocio, loading, error };
}