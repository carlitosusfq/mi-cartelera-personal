import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabaseClient';
import './App.css';
import BuscadorTMDB from './components/BuscadorTMDB';
import MiColeccion from './components/MiColeccion';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  const [esRegistro, setEsRegistro] = useState(false);
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    let activo = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!activo) return;

      if (error) setMensaje(error.message);
      setSession(data.session);
      setCargandoSesion(false);
    });

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, nuevaSesion) => {
        setSession(nuevaSesion);
        setCargandoSesion(false);
      });

    return () => {
      activo = false;
      subscription.unsubscribe();
    };
  }, []);

  async function manejarAutenticacion(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensaje('');
    setProcesando(true);

    try {
      if (esRegistro) {
        const { data, error } = await supabase.auth.signUp({
          email: correo.trim(),
          password: contrasena,
        });

        if (error) throw error;

        if (data.session) {
          setMensaje('¡Cuenta creada correctamente!');
        } else {
          setMensaje(
            'Revisa tu correo electrónico para confirmar tu cuenta.'
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: correo.trim(),
          password: contrasena,
        });

        if (error) throw error;
      }
    } catch (error) {
      setMensaje(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error inesperado.'
      );
    } finally {
      setProcesando(false);
    }
  }

  async function cerrarSesion() {
    setProcesando(true);
    const { error } = await supabase.auth.signOut();

    if (error) setMensaje(error.message);
    else {
      setCorreo('');
      setContrasena('');
      setMensaje('');
    }

    setProcesando(false);
  }

  if (cargandoSesion) {
    return (
      <main className="pantalla-auth">
        <p>Verificando sesión...</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="pantalla-auth">
        <div className="auth-card">
          <div className="logo">🎬 Mi <span>Cartelera</span></div>

          <h1>{esRegistro ? 'Crear cuenta' : 'Bienvenido de nuevo'}</h1>

          <p className="auth-descripcion">
            {esRegistro
              ? 'Regístrate para crear tu colección personal.'
              : 'Inicia sesión para acceder a tus películas y series.'}
          </p>

          <form onSubmit={manejarAutenticacion}>
            <label htmlFor="correo">Correo electrónico</label>
            <input
              id="correo"
              type="email"
              placeholder="ejemplo@correo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              autoComplete="email"
              required
            />

            <label htmlFor="contrasena">Contraseña</label>
            <input
              id="contrasena"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              autoComplete={
                esRegistro ? 'new-password' : 'current-password'
              }
              minLength={6}
              required
            />

            <button
              className="boton boton-ancho"
              type="submit"
              disabled={procesando}
            >
              {procesando
                ? 'Procesando...'
                : esRegistro
                  ? 'Registrarme'
                  : 'Iniciar sesión'}
            </button>
          </form>

          {mensaje && (
            <p className="mensaje-auth" role="status">{mensaje}</p>
          )}

          <p className="cambiar-auth">
            {esRegistro ? '¿Ya tienes una cuenta?' : '¿No tienes cuenta?'}
            <button
              type="button"
              onClick={() => {
                setEsRegistro(!esRegistro);
                setMensaje('');
              }}
            >
              {esRegistro ? 'Iniciar sesión' : 'Registrarme'}
            </button>
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="contenedor">
      <header className="encabezado">
        <div className="logo">
          🎬 Mi <span>Cartelera</span>
        </div>

        <button
          className="boton"
          onClick={cerrarSesion}
          disabled={procesando}
        >
          Cerrar sesión
        </button>
      </header>

      <section className="hero">
        <h1>Tu universo de películas y series 🍿</h1>
        <p>
          ¡Bienvenido! Has iniciado sesión correctamente.
        </p>
        <p className="usuario-correo">
          {session.user.email}
        </p>
      </section>

      <BuscadorTMDB />
      <MiColeccion />

      <section>
        <h2 className="seccion-titulo">
          ¿Qué puedes hacer aquí?
        </h2>

        <div className="tarjetas">
          <article className="tarjeta">
            <div className="tarjeta-icono">🔎</div>
            <h3>Explorar películas</h3>
            <p>Busca películas y series de todo el mundo.</p>
          </article>

          <article className="tarjeta">
            <div className="tarjeta-icono">🎞️</div>
            <h3>Mi colección</h3>
            <p>Guarda lo que quieres ver y lo que ya viste.</p>
          </article>

          <article className="tarjeta">
            <div className="tarjeta-icono">⭐</div>
            <h3>Mis calificaciones</h3>
            <p>Califica tus títulos y escribe comentarios.</p>
          </article>
        </div>
      </section>
    </div>
  );
}

export default App;
