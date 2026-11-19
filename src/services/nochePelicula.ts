
import { supabase } from '../lib/supabaseClient';

export interface PeliculaElegible {
  id: number;
  tmdb_id: number;
  titulo: string;
  poster_url: string | null;
}

export interface PeliculaSesion {
  id: string;
  tmdb_id: number;
  titulo: string;
  poster_url: string | null;
  duracion_minutos: number;
  posicion: number;
}

export interface SesionPelicula {
  id: string;
  nombre: string;
  tiempo_disponible: number;
  duracion_total: number;
  creada_en: string;
  sesion_peliculas: PeliculaSesion[];
}

export async function obtenerPeliculasElegibles():
  Promise<PeliculaElegible[]> {

  const { data: { user }, error: authError } =
    await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Debes iniciar sesión.');
  }

  const { data, error } = await supabase
    .from('mi_lista')
    .select('id, tmdb_id, titulo, poster_url')
    .eq('user_id', user.id)
    .eq('tipo_contenido', 'pelicula')
    .eq('estado', 'por_ver')
    .order('titulo', { ascending: true });

  if (error) throw error;

  return data ?? [];
}

export async function guardarNoche(
  nombre: string,
  tiempoDisponible: number,
  peliculas: number[],
): Promise<string> {

  const { data, error } = await supabase.functions.invoke(
    'guardar-noche',
    {
      body: {
        nombre,
        tiempo_disponible: tiempoDisponible,
        peliculas,
      },
    },
  );

  if (error) {
    throw new Error(
      error.message || 'No se pudo guardar la noche.',
    );
  }

  if (!data?.sesion_id) {
    throw new Error('El servidor no devolvió la sesión.');
  }

  return data.sesion_id as string;
}

export async function obtenerSesiones():
  Promise<SesionPelicula[]> {

  const { data: { user }, error: authError } =
    await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Debes iniciar sesión.');
  }

  const { data, error } = await supabase
    .from('sesiones_pelicula')
    .select(`
      id,
      nombre,
      tiempo_disponible,
      duracion_total,
      creada_en,
      sesion_peliculas (
        id,
        tmdb_id,
        titulo,
        poster_url,
        duracion_minutos,
        posicion
      )
    `)
    .eq('user_id', user.id)
    .order('creada_en', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((sesion) => ({
    ...sesion,
    sesion_peliculas: [...sesion.sesion_peliculas].sort(
      (a, b) => a.posicion - b.posicion,
    ),
  }));
}
