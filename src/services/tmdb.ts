const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const BASE_URL = 'https://api.themoviedb.org/3';

export interface PeliculaTMDB {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  overview: string;
  media_type: 'movie' | 'tv';
}

interface RespuestaBusqueda {
  results: PeliculaTMDB[];
}

export async function buscarTitulos(
  texto: string
): Promise<PeliculaTMDB[]> {
  if (!API_KEY) {
    throw new Error('Falta configurar la API Key de TMDB');
  }

  const parametros = new URLSearchParams({
    api_key: API_KEY,
    query: texto,
    language: 'es-ES',
    include_adult: 'false',
  });

  const respuesta = await fetch(
    `${BASE_URL}/search/multi?${parametros}`
  );

  if (!respuesta.ok) {
    throw new Error('No se pudieron buscar los títulos');
  }

  const datos: RespuestaBusqueda = await respuesta.json();

  return datos.results.filter(
    (item) =>
      item.media_type === 'movie' ||
      item.media_type === 'tv'
  );
}

export function obtenerPoster(
  ruta: string | null
): string | null {
  return ruta
    ? `https://image.tmdb.org/t/p/w500${ruta}`
    : null;
}

export interface DetalleTMDB {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genres: { id: number; name: string }[];
  credits?: {
    cast: {
      id: number;
      name: string;
      character: string;
    }[];
  };
  aggregate_credits?: {
    cast: {
      id: number;
      name: string;
      roles: { character: string }[];
    }[];
  };
}

export async function obtenerDetalles(
  tmdbId: number,
  tipo: 'pelicula' | 'serie'
): Promise<DetalleTMDB> {
  if (!API_KEY) {
    throw new Error('Falta configurar la API Key de TMDB');
  }

  const ruta = tipo === 'pelicula' ? 'movie' : 'tv';
  const creditos =
    tipo === 'pelicula' ? 'credits' : 'aggregate_credits';

  const parametros = new URLSearchParams({
    api_key: API_KEY,
    language: 'es-ES',
    append_to_response: creditos,
  });

  const respuesta = await fetch(
    `${BASE_URL}/${ruta}/${tmdbId}?${parametros}`
  );

  if (!respuesta.ok) {
    throw new Error('No se pudieron cargar los detalles.');
  }

  return (await respuesta.json()) as DetalleTMDB;
}
