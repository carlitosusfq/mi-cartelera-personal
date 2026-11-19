
import { useEffect, useState } from 'react';

import {
  obtenerPeliculasElegibles,
  obtenerSesiones,
  guardarNoche,
} from '../services/nochePelicula';

import type {
  PeliculaElegible,
  SesionPelicula,
} from '../services/nochePelicula';

import { obtenerDetalles } from '../services/tmdb';

interface NocheDePeliculaProps {
  versionColeccion: number;
}

function NocheDePelicula({
  versionColeccion,
}: NocheDePeliculaProps) {
  const [nombre, setNombre] = useState('');
  const [tiempo, setTiempo] = useState(180);

  const [peliculas, setPeliculas] =
    useState<PeliculaElegible[]>([]);

  const [duraciones, setDuraciones] =
    useState<Record<number, number | null>>({});

  const [seleccionadas, setSeleccionadas] =
    useState<number[]>([]);

  const [sesiones, setSesiones] =
    useState<SesionPelicula[]>([]);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  // =====================================================
  // 1. CARGAR Y ACTUALIZAR PELÍCULAS
  // =====================================================

  useEffect(() => {
    let activo = true;

    async function cargarDatos() {
      setCargando(true);
      setError('');

      try {
        const [lista, historial] = await Promise.all([
          obtenerPeliculasElegibles(),
          obtenerSesiones(),
        ]);

        if (!activo) return;

        setPeliculas(lista);
        setSesiones(historial);

        // Consultar las duraciones desde TMDB.
        const resultados = await Promise.allSettled(
          lista.map((pelicula) =>
            obtenerDetalles(
              pelicula.tmdb_id,
              'pelicula',
            ),
          ),
        );

        if (!activo) return;

        const nuevasDuraciones:
          Record<number, number | null> = {};

        resultados.forEach((resultado, indice) => {
          const id = lista[indice].tmdb_id;

          if (resultado.status === 'fulfilled') {
            const runtime = resultado.value.runtime;

            nuevasDuraciones[id] =
              typeof runtime === 'number' &&
              Number.isInteger(runtime) &&
              runtime >= 1 &&
              runtime <= 600
                ? runtime
                : null;
          } else {
            nuevasDuraciones[id] = null;
          }
        });

        setDuraciones(nuevasDuraciones);

        // Eliminar de la selección las películas que:
        // - Ya no están en la colección.
        // - Cambiaron de estado.
        // - No tienen duración válida.

        const idsElegibles = new Set(
          lista
            .filter(
              (pelicula) =>
                nuevasDuraciones[pelicula.tmdb_id] != null,
            )
            .map((pelicula) => pelicula.tmdb_id),
        );

        setSeleccionadas((actuales) =>
          actuales.filter((id) => idsElegibles.has(id)),
        );

      } catch (err) {
        if (!activo) return;

        setError(
          err instanceof Error
            ? err.message
            : 'No se pudieron cargar los datos.',
        );
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    void cargarDatos();

    return () => {
      activo = false;
    };

  }, [versionColeccion]);

  // =====================================================
  // 2. CALCULAR DURACIONES Y PAUSAS
  // =====================================================

  const minutosPeliculas = seleccionadas.reduce(
    (total, id) => total + (duraciones[id] ?? 0),
    0,
  );

  const pausas =
    Math.max(0, seleccionadas.length - 1) * 10;

  const duracionTotal = minutosPeliculas + pausas;

  const tiempoRestante = tiempo - duracionTotal;

  const duracionesDesconocidas = seleccionadas.some(
    (id) => duraciones[id] == null,
  );

  const tiempoValido =
    Number.isInteger(tiempo) &&
    tiempo >= 30 &&
    tiempo <= 600;

  const seleccionValida =
    seleccionadas.length >= 1 &&
    seleccionadas.length <= 20 &&
    !duracionesDesconocidas &&
    tiempoValido &&
    duracionTotal <= tiempo;

  // =====================================================
  // 3. IDENTIFICAR PELÍCULAS QUE CABEN
  // =====================================================

  const peliculasQueCaben = peliculas.filter(
    (pelicula) => {
      if (seleccionadas.includes(pelicula.tmdb_id)) {
        return false;
      }

      if (seleccionadas.length >= 20) {
        return false;
      }

      const duracion = duraciones[pelicula.tmdb_id];

      if (duracion == null || !tiempoValido) {
        return false;
      }

      const pausaAdicional =
        seleccionadas.length > 0 ? 10 : 0;

      return (
        duracionTotal + pausaAdicional + duracion <= tiempo
      );
    },
  );

  // =====================================================
  // 4. SELECCIONAR O QUITAR PELÍCULAS
  // =====================================================

  function alternarPelicula(id: number) {
    setSeleccionadas((actuales) => {
      if (actuales.includes(id)) {
        return actuales.filter((valor) => valor !== id);
      }

      if (actuales.length >= 20) {
        return actuales;
      }

      return [...actuales, id];
    });

    setMensaje('');
    setError('');
  }

  // =====================================================
  // 5. GUARDAR NOCHE DE PELÍCULA
  // =====================================================

  async function guardarSesion() {
    setError('');
    setMensaje('');

    if (!nombre.trim()) {
      setError('Escribe un nombre para la sesión.');
      return;
    }

    if (nombre.trim().length > 100) {
      setError(
        'El nombre no puede superar los 100 caracteres.',
      );
      return;
    }

    if (!tiempoValido) {
      setError(
        'El tiempo debe estar entre 30 y 600 minutos.',
      );
      return;
    }

    if (!seleccionValida) {
      setError(
        'Revisa las películas y el tiempo disponible.',
      );
      return;
    }

    setGuardando(true);

    try {
      await guardarNoche(
        nombre.trim(),
        tiempo,
        seleccionadas,
      );

      const historial = await obtenerSesiones();

      setSesiones(historial);
      setNombre('');
      setSeleccionadas([]);

      setMensaje(
        '¡Noche de película guardada correctamente!',
      );

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo guardar la sesión.',
      );
    } finally {
      setGuardando(false);
    }
  }

  // =====================================================
  // 6. INTERFAZ
  // =====================================================

  return (
    <section className="seccion-noche">
      <h2 className="seccion-titulo">
        🍿 Noche de película
      </h2>

      <p className="descripcion-busqueda">
        Organiza una sesión con tus películas pendientes
        y descubre cuáles caben en tu tiempo disponible.
      </p>

      {cargando ? (
        <p>Cargando películas y duraciones...</p>
      ) : (
        <>
          {/* FORMULARIO */}
          <div className="noche-formulario">
            <label htmlFor="nombre-noche">
              Nombre de la sesión
            </label>

            <input
              id="nombre-noche"
              type="text"
              maxLength={100}
              value={nombre}
              onChange={(e) =>
                setNombre(e.target.value)
              }
              placeholder="Ejemplo: Maratón del viernes"
            />

            <label htmlFor="tiempo-noche">
              Tiempo disponible (minutos)
            </label>

            <input
              id="tiempo-noche"
              type="number"
              min={30}
              max={600}
              step={1}
              value={tiempo}
              onChange={(e) =>
                setTiempo(Number(e.target.value))
              }
            />

            <p>
              Tiempo disponible:{' '}
              <strong>{tiempo} min</strong>
            </p>
          </div>

          {/* PELÍCULAS */}
          <h3>Selecciona tus películas por ver</h3>

          {peliculas.length === 0 ? (
            <p className="mensaje-busqueda">
              No tienes películas pendientes por ver.
              Agrega alguna a tu colección.
            </p>
          ) : (
            <div className="noche-peliculas">
              {peliculas.map((pelicula) => {
                const id = pelicula.tmdb_id;
                const duracion = duraciones[id];

                const seleccionada =
                  seleccionadas.includes(id);

                const cabe = peliculasQueCaben.some(
                  (item) =>
                    item.tmdb_id === id,
                );

                return (
                  <label
                    key={pelicula.id}
                    className="noche-pelicula"
                  >
                    <input
                      type="checkbox"
                      checked={seleccionada}
                      disabled={
                        guardando ||
                        duracion == null ||
                        (!seleccionada &&
                          seleccionadas.length >= 20)
                      }
                      onChange={() =>
                        alternarPelicula(id)
                      }
                    />

                    {pelicula.poster_url ? (
                      <img
                        src={pelicula.poster_url}
                        alt={`Póster de ${pelicula.titulo}`}
                        loading="lazy"
                      />
                    ) : (
                      <div className="poster-vacio">
                        🎬 Sin póster
                      </div>
                    )}

                    <span>{pelicula.titulo}</span>

                    <small>
                      {duracion == null
                        ? 'Duración no disponible'
                        : `${duracion} minutos`}
                    </small>

                    {seleccionada ? (
                      <small className="noche-disponible">
                        ✅ Seleccionada
                      </small>
                    ) : cabe ? (
                      <small className="noche-disponible">
                        ✅ Cabe en tu tiempo
                      </small>
                    ) : duracion != null ? (
                      <small className="noche-no-cabe">
                        ❌ No cabe actualmente
                      </small>
                    ) : null}
                  </label>
                );
              })}
            </div>
          )}

          {/* RESUMEN */}
          <div className="noche-resumen-tiempo">
            <h3>⏱️ Resumen de tu sesión</h3>

            <p>
              Películas seleccionadas:{' '}
              <strong>
                {seleccionadas.length}
              </strong>
            </p>

            <p>
              Duración de películas:{' '}
              <strong>
                {minutosPeliculas} min
              </strong>
            </p>

            <p>
              Pausas entre películas:{' '}
              <strong>{pausas} min</strong>
            </p>

            <p>
              Duración total:{' '}
              <strong>
                {duracionTotal} min
              </strong>
            </p>

            <p>
              Tiempo restante:{' '}
              <strong
                className={
                  tiempoRestante < 0
                    ? 'noche-no-cabe'
                    : 'noche-disponible'
                }
              >
                {tiempoRestante} min
              </strong>
            </p>

            {duracionesDesconocidas && (
              <p className="error-busqueda">
                Hay películas seleccionadas sin duración
                verificada.
              </p>
            )}

            {duracionTotal > tiempo && (
              <p className="error-busqueda">
                La selección supera el tiempo disponible.
                Quita una película o aumenta el tiempo.
              </p>
            )}
          </div>

          <p className="descripcion-busqueda">
            Se incluyen pausas de 10 minutos entre
            películas. El servidor verificará las duraciones
            antes de guardar.
          </p>

          {/* MENSAJES */}
          {error && (
            <p
              className="error-busqueda"
              role="alert"
            >
              {error}
            </p>
          )}

          {mensaje && (
            <p
              className="mensaje-exito"
              role="status"
            >
              {mensaje}
            </p>
          )}

          {/* GUARDAR */}
          <button
            type="button"
            className="boton"
            onClick={() =>
              void guardarSesion()
            }
            disabled={
              cargando ||
              guardando ||
              !seleccionValida
            }
          >
            {guardando
              ? 'Guardando...'
              : 'Guardar noche de película'}
          </button>

          {/* HISTORIAL */}
          <div className="noche-historial">
            <h3>📅 Mis noches guardadas</h3>

            {sesiones.length === 0 ? (
              <p className="mensaje-busqueda">
                Todavía no tienes sesiones guardadas.
              </p>
            ) : (
              sesiones.map((sesion) => (
                <article
                  className="noche-sesion"
                  key={sesion.id}
                >
                  <h4>{sesion.nombre}</h4>

                  <p>
                    {new Date(
                      sesion.creada_en,
                    ).toLocaleDateString('es-EC')}
                  </p>

                  <p>
                    Duración total:{' '}
                    <strong>
                      {sesion.duracion_total} minutos
                    </strong>
                  </p>

                  <p>
                    Tiempo disponible:{' '}
                    {sesion.tiempo_disponible} minutos
                  </p>

                  <ol>
                    {sesion.sesion_peliculas.map(
                      (pelicula) => (
                        <li key={pelicula.id}>
                          {pelicula.titulo} —{' '}
                          {pelicula.duracion_minutos} min
                        </li>
                      ),
                    )}
                  </ol>
                </article>
              ))
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default NocheDePelicula;
