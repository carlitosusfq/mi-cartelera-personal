import { useEffect, useState } from 'react';
import {
  obtenerDetalles,
  obtenerPoster,
} from '../services/tmdb';
import type { DetalleTMDB } from '../services/tmdb';

interface TituloSeleccionado {
  tmdb_id: number;
  titulo: string;
  poster_url: string | null;
  tipo_contenido: 'pelicula' | 'serie';
  estado: 'por_ver' | 'viendo' | 'vista';
  calificacion_personal: number | null;
  comentario: string | null;
}

interface Props {
  titulo: TituloSeleccionado;
  onVolver: () => void;
}

function DetalleTitulo({ titulo, onVolver }: Props) {
  const [detalle, setDetalle] = useState<DetalleTMDB | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;

    obtenerDetalles(titulo.tmdb_id, titulo.tipo_contenido)
      .then((datos) => {
        if (activo) setDetalle(datos);
      })
      .catch((error) => {
        if (activo) {
          setError(
            error instanceof Error
              ? error.message
              : 'Error al cargar los detalles.'
          );
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [titulo.tmdb_id, titulo.tipo_contenido]);

  const reparto = titulo.tipo_contenido === 'pelicula'
    ? detalle?.credits?.cast.map((actor) => ({
        id: actor.id,
        nombre: actor.name,
        personaje: actor.character,
      })) ?? []
    : detalle?.aggregate_credits?.cast.map((actor) => ({
        id: actor.id,
        nombre: actor.name,
        personaje: actor.roles[0]?.character ?? '',
      })) ?? [];

  const poster =
    titulo.poster_url ||
    obtenerPoster(detalle?.poster_path ?? null);

  const fecha =
    detalle?.release_date ||
    detalle?.first_air_date ||
    '';

  const estadoTexto = {
    por_ver: 'Por ver',
    viendo: 'Viendo',
    vista: 'Vista',
  }[titulo.estado];

  return (
    <div className="detalle-fondo">
      <section
        className="detalle-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-detalle"
      >
        <button
          className="boton-volver"
          type="button"
          onClick={onVolver}
          autoFocus
        >
          ← Volver a mi colección
        </button>

        <div className="detalle-contenido">
          <div className="detalle-poster">
            {poster ? (
              <img src={poster} alt={`Póster de ${titulo.titulo}`} />
            ) : (
              <div className="poster-vacio">Sin póster</div>
            )}
          </div>

          <div className="detalle-informacion">
            <h2 id="titulo-detalle">{titulo.titulo}</h2>

            <p className="detalle-meta">
              {titulo.tipo_contenido === 'pelicula'
                ? '🎬 Película'
                : '📺 Serie'}
              {fecha && ` · ${fecha.slice(0, 4)}`}
            </p>

            {cargando && <p>Cargando información...</p>}
            {error && (
              <p className="error-busqueda" role="alert">{error}</p>
            )}

            {detalle && (
              <>
                <p className="detalle-meta">
                  {detalle.genres.map((g) => g.name).join(' · ')}
                </p>

                <p className="detalle-meta">
                  ⭐ TMDB: {detalle.vote_average.toFixed(1)}/10
                </p>

                <h3>Sinopsis</h3>
                <p>
                  {detalle.overview ||
                    'No hay sinopsis disponible en español.'}
                </p>

                <h3>Reparto principal</h3>
                {reparto.length > 0 ? (
                  <ul className="lista-reparto">
                    {reparto.slice(0, 8).map((actor) => (
                      <li key={actor.id}>
                        <strong>{actor.nombre}</strong>
                        {actor.personaje && ` — ${actor.personaje}`}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No hay información del reparto disponible.</p>
                )}
              </>
            )}

            <div className="detalle-personal">
              <h3>Mi información personal</h3>

              <p>Estado: <strong>{estadoTexto}</strong></p>

              <p>
                Mi calificación:{' '}
                <strong>
                  {titulo.calificacion_personal === null
                    ? 'Sin calificar'
                    : `⭐ ${titulo.calificacion_personal}/5`}
                </strong>
              </p>

              <h3>Mi comentario</h3>
              <p>
                {titulo.comentario ||
                  'Todavía no has escrito un comentario.'}
              </p>
            </div>
          </div>
        </div>

        <p className="atribucion-tmdb">
          Información de películas y series proporcionada por TMDB.
          Este producto utiliza la API de TMDB, pero no está
          avalado ni certificado por TMDB.
        </p>
      </section>
    </div>
  );
}

export default DetalleTitulo;
