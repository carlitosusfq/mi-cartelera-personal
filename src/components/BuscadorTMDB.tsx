import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  buscarTitulos,
  obtenerPoster,
} from '../services/tmdb';
import type { PeliculaTMDB } from '../services/tmdb';
import { supabase } from '../lib/supabaseClient';

function BuscadorTMDB() {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<PeliculaTMDB[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const [guardandoId, setGuardandoId] = useState<string | null>(null);
  const [mensajeGuardar, setMensajeGuardar] = useState('');

  async function agregarAMiLista(pelicula: PeliculaTMDB) {
    const identificador = `${pelicula.media_type}-${pelicula.id}`;

    setGuardandoId(identificador);
    setMensajeGuardar('');

    try {
      const { data: { user }, error: errorUsuario } =
        await supabase.auth.getUser();

      if (errorUsuario || !user) {
        throw new Error('Debes iniciar sesión para guardar títulos.');
      }

      const { error } = await supabase.from('mi_lista').insert({
        user_id: user.id,
        tmdb_id: pelicula.id,
        titulo: pelicula.title || pelicula.name || 'Sin título',
        poster_url: obtenerPoster(pelicula.poster_path),
        tipo_contenido:
          pelicula.media_type === 'movie' ? 'pelicula' : 'serie',
        estado: 'por_ver',
        calificacion_personal: null,
        comentario: null,
      });

      if (error) {
        if (error.code === '23505') {
          throw new Error('Esta película o serie ya está en tu lista.');
        }
        throw error;
      }

      setMensajeGuardar('¡Título agregado correctamente a tu lista!');
    } catch (error) {
      setMensajeGuardar(
        error instanceof Error
          ? error.message
          : 'No se pudo guardar el título.'
      );
    } finally {
      setGuardandoId(null);
    }
  }
  
  async function manejarBusqueda(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!busqueda.trim() || cargando) return;

    setCargando(true);
    setError('');
    setResultados([]);

    try {
      const peliculas = await buscarTitulos(busqueda.trim());
      setResultados(peliculas);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al buscar.'
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <section className="seccion-busqueda">
      <h2 className="seccion-titulo">
        🔎 Explorar películas y series
      </h2>

      <p className="descripcion-busqueda">
        Encuentra tus títulos favoritos en TMDB.
      </p>

      <form className="form-busqueda" onSubmit={manejarBusqueda}>
        <input
          type="search"
          placeholder="Ejemplo: Batman, Interstellar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          aria-label="Buscar películas y series"
          required
        />

        <button
          className="boton"
          type="submit"
          disabled={cargando}
        >
          {cargando ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {cargando && (
        <p className="mensaje-busqueda" role="status">
          Buscando películas y series...
        </p>
      )}

      {error && (
        <p className="error-busqueda" role="alert">
          {error}
        </p>
      )}

      {!cargando && !error && resultados.length === 0 && (
        <p className="mensaje-busqueda">
          Escribe el nombre de una película o serie para comenzar.
        </p>
      )}

      {mensajeGuardar && (
        <p className="mensaje-busqueda" role="status">
            {mensajeGuardar}
        </p>
      )}


      <div className="grid-peliculas">
        {resultados.map((pelicula) => {
          const titulo = pelicula.title || pelicula.name || 'Sin título';
          const fecha =
            pelicula.release_date || pelicula.first_air_date || '';
          const poster = obtenerPoster(pelicula.poster_path);

          return (
            <article
              className="pelicula-card"
              key={`${pelicula.media_type}-${pelicula.id}`}
            >
              {poster ? (
                <img
                  src={poster}
                  alt={`Póster de ${titulo}`}
                  loading="lazy"
                />
              ) : (
                <div className="poster-vacio">
                  🎬 Sin póster disponible
                </div>
              )}

              <div className="pelicula-info">
                <h3>{titulo}</h3>
                <p>{fecha ? fecha.slice(0, 4) : 'Sin año'}</p>
                <span className="tipo-pelicula">
                  {pelicula.media_type === 'movie'
                    ? 'Película'
                    : 'Serie'}
                </span>

                <button
                    className="boton boton-agregar"
                    type="button"
                    onClick={() => agregarAMiLista(pelicula)}
                    disabled={
                        guardandoId === `${pelicula.media_type}-${pelicula.id}`
                    }
                    >
                    {guardandoId === `${pelicula.media_type}-${pelicula.id}`
                        ? 'Guardando...'
                        : '+ Agregar a mi lista'}
                </button>
               
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default BuscadorTMDB;
