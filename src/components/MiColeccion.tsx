import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import DetalleTitulo from './DetalleTitulo';

type Estado = 'por_ver' | 'viendo' | 'vista';

interface TituloGuardado {
  id: number;
  tmdb_id: number;
  titulo: string;
  poster_url: string | null;
  tipo_contenido: 'pelicula' | 'serie';
  estado: Estado;
  calificacion_personal: number | null;
  comentario: string | null;
  fecha_agregado: string;
}

function MiColeccion() {
  const [titulos, setTitulos] = useState<TituloGuardado[]>([]);
  
  const [filtro, setFiltro] = useState<
  'todos' | 'por_ver' | 'viendo' | 'vista'
  >('todos');

  const [orden, setOrden] = useState<
  'recientes' | 'antiguos' | 'mejor_calificados'
  >('recientes');

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);

  const [estado, setEstado] = useState<Estado>('por_ver');
  const [calificacion, setCalificacion] = useState('');
  const [comentario, setComentario] = useState('');

  const [tituloSeleccionado, setTituloSeleccionado] =
  useState<TituloGuardado | null>(null);

  async function obtenerUsuario() {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      throw new Error('Debes iniciar sesión.');
    }

    return user;
  }

  async function cargarColeccion() {
    setCargando(true);
    setError('');

    try {
      const user = await obtenerUsuario();

      const { data, error } = await supabase
        .from('mi_lista')
        .select('*')
        .eq('user_id', user.id)
        .order('fecha_agregado', { ascending: false });

      if (error) throw error;

      setTitulos(data ?? []);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'No se pudo cargar tu colección.'
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    void cargarColeccion();
  }, []);

  function comenzarEdicion(titulo: TituloGuardado) {
    setEditandoId(titulo.id);
    setEstado(titulo.estado);
    setCalificacion(
      titulo.calificacion_personal?.toString() ?? ''
    );
    setComentario(titulo.comentario ?? '');
    setMensaje('');
    setError('');
  }

  async function guardarCambios(id: number) {
    setProcesandoId(id);
    setError('');
    setMensaje('');

    try {
      const user = await obtenerUsuario();

      const { data, error } = await supabase
        .from('mi_lista')
        .update({
          estado,
          calificacion_personal: calificacion
            ? Number(calificacion)
            : null,
          comentario: comentario.trim() || null,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select('id');

      if (error) throw error;

      if (!data?.length) {
        throw new Error('No se encontró el registro para actualizar.');
      }

      setEditandoId(null);
      setMensaje('¡Cambios guardados correctamente!');
      await cargarColeccion();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'No se pudieron guardar los cambios.'
      );
    } finally {
      setProcesandoId(null);
    }
  }

  async function eliminarTitulo(id: number, nombre: string) {
    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar "${nombre}" de tu colección?`
    );

    if (!confirmar) return;

    setProcesandoId(id);
    setError('');
    setMensaje('');

    try {
      const user = await obtenerUsuario();

      const { data, error } = await supabase
        .from('mi_lista')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
        .select('id');

      if (error) throw error;

      if (!data?.length) {
        throw new Error('No se encontró el registro para eliminar.');
      }

      if (editandoId === id) setEditandoId(null);

      setMensaje('Título eliminado correctamente.');
      await cargarColeccion();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'No se pudo eliminar el título.'
      );
    } finally {
      setProcesandoId(null);
    }
  }

    const totalPorVer = titulos.filter(
    (titulo) => titulo.estado === 'por_ver'
    ).length;

    const totalViendo = titulos.filter(
    (titulo) => titulo.estado === 'viendo'
    ).length;

    const totalVistas = titulos.filter(
    (titulo) => titulo.estado === 'vista'
    ).length;

    const titulosFiltrados = titulos
    .filter((titulo) =>
        filtro === 'todos' || titulo.estado === filtro
    )
    .sort((a, b) => {
        if (orden === 'mejor_calificados') {
        return (
            (b.calificacion_personal ?? 0) -
            (a.calificacion_personal ?? 0)
        );
        }

        const fechaA = new Date(a.fecha_agregado).getTime();
        const fechaB = new Date(b.fecha_agregado).getTime();

        if (orden === 'antiguos') {
        return fechaA - fechaB;
        }

        return fechaB - fechaA;
    });

  function mostrarEstado(valor: Estado) {
    if (valor === 'por_ver') return 'Por ver';
    if (valor === 'viendo') return 'Viendo';
    return 'Vista';
  }

  return (
    <section className="seccion-coleccion">
        {tituloSeleccionado && (
        <DetalleTitulo
            titulo={tituloSeleccionado}
            onVolver={() => setTituloSeleccionado(null)}
        />
        )}
      <div className="coleccion-encabezado">
        <div>
          <h2 className="seccion-titulo">🎞️ Mi Colección</h2>
          <p className="descripcion-busqueda">
            Organiza, califica y administra tus películas y series.
          </p>
        </div>

        <button
          className="boton"
          onClick={() => void cargarColeccion()}
          disabled={cargando}
        >
          Actualizar lista
        </button>
      </div>

    {/* Contadores */}
    <div className="resumen-coleccion">
    <div className="resumen-card">
        <span>📌 Por ver</span>
        <strong>{totalPorVer}</strong>
    </div>

    <div className="resumen-card">
        <span>▶️ Viendo</span>
        <strong>{totalViendo}</strong>
    </div>

    <div className="resumen-card">
        <span>✅ Vistas</span>
        <strong>{totalVistas}</strong>
    </div>
    </div>

    {/* Filtros y ordenamiento */}
    <div className="controles-coleccion">
    <div className="grupo-control">
        <label htmlFor="filtro-estado">
        Filtrar por estado
        </label>

        <select
        id="filtro-estado"
        value={filtro}
        onChange={(e) =>
            setFiltro(e.target.value as typeof filtro)
        }
        >
        <option value="todos">Todos los títulos</option>
        <option value="por_ver">Por ver</option>
        <option value="viendo">Viendo</option>
        <option value="vista">Vista</option>
        </select>
    </div>

    <div className="grupo-control">
        <label htmlFor="orden-coleccion">
        Ordenar por
        </label>

        <select
        id="orden-coleccion"
        value={orden}
        onChange={(e) =>
            setOrden(e.target.value as typeof orden)
        }
        >
        <option value="recientes">Más recientes</option>
        <option value="antiguos">Más antiguos</option>
        <option value="mejor_calificados">
            Mejor calificados
        </option>
        </select>
    </div>
    </div>

      {cargando && <p>Cargando tu colección...</p>}
      {error && <p className="error-busqueda" role="alert">{error}</p>}
      {mensaje && (
        <p className="mensaje-exito" role="status">{mensaje}</p>
      )}

      {!cargando && !error && titulos.length === 0 && (
        <p className="mensaje-busqueda">
          Todavía no tienes películas guardadas.
        </p>
      )}

      <div className="grid-peliculas">
        {titulosFiltrados.map((titulo) => (
          <article className="pelicula-card" key={titulo.id}>
            {titulo.poster_url ? (
              <img
                src={titulo.poster_url}
                alt={`Póster de ${titulo.titulo}`}
                loading="lazy"
              />
            ) : (
              <div className="poster-vacio">🎬 Sin póster</div>
            )}

            <div className="pelicula-info">
              <h3>
                <button
                    type="button"
                    className="enlace-detalle"
                    onClick={() => setTituloSeleccionado(titulo)}
                >
                    {titulo.titulo}
                </button>
              </h3>

              <p>
                {titulo.tipo_contenido === 'pelicula'
                  ? 'Película'
                  : 'Serie'}
              </p>

              {editandoId === titulo.id ? (
                <div className="form-edicion">
                  <label htmlFor={`estado-${titulo.id}`}>
                    Estado
                  </label>
                  <select
                    id={`estado-${titulo.id}`}
                    value={estado}
                    onChange={(e) =>
                      setEstado(e.target.value as Estado)
                    }
                  >
                    <option value="por_ver">Por ver</option>
                    <option value="viendo">Viendo</option>
                    <option value="vista">Vista</option>
                  </select>

                  <label htmlFor={`calificacion-${titulo.id}`}>
                    Mi calificación
                  </label>
                  <select
                    id={`calificacion-${titulo.id}`}
                    value={calificacion}
                    onChange={(e) =>
                      setCalificacion(e.target.value)
                    }
                  >
                    <option value="">Sin calificar</option>
                    <option value="1">⭐ 1</option>
                    <option value="2">⭐⭐ 2</option>
                    <option value="3">⭐⭐⭐ 3</option>
                    <option value="4">⭐⭐⭐⭐ 4</option>
                    <option value="5">⭐⭐⭐⭐⭐ 5</option>
                  </select>

                  <label htmlFor={`comentario-${titulo.id}`}>
                    Mi comentario
                  </label>
                  <textarea
                    id={`comentario-${titulo.id}`}
                    value={comentario}
                    onChange={(e) =>
                      setComentario(e.target.value)
                    }
                    placeholder="¿Qué opinas de este título?"
                    rows={4}
                  />

                  <button
                    className="boton boton-agregar"
                    onClick={() => void guardarCambios(titulo.id)}
                    disabled={procesandoId !== null}
                  >
                    {procesandoId === titulo.id
                      ? 'Guardando...'
                      : 'Guardar cambios'}
                  </button>

                  <button
                    className="boton-cancelar"
                    onClick={() => setEditandoId(null)}
                    disabled={procesandoId !== null}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <>
                  <span className="tipo-pelicula">
                    {mostrarEstado(titulo.estado)}
                  </span>

                  <p className="calificacion-coleccion">
                    ⭐ {titulo.calificacion_personal ?? 'Sin calificar'}
                  </p>

                  {titulo.comentario && (
                    <p className="comentario-coleccion">
                      {titulo.comentario}
                    </p>
                  )}

                  <button
                    className="boton boton-agregar"
                    onClick={() => comenzarEdicion(titulo)}
                    disabled={procesandoId !== null}
                  >
                    ✏️ Editar
                  </button>

                  <button
                    className="boton-eliminar"
                    onClick={() =>
                      void eliminarTitulo(titulo.id, titulo.titulo)
                    }
                    disabled={procesandoId !== null}
                  >
                    🗑️ Eliminar
                  </button>
                </>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default MiColeccion;
