
-- ======================================================
-- E2: Noche de película
-- Migración 001: Tablas, restricciones y RLS
-- Estado: pendiente de ejecución y pruebas
-- ======================================================

BEGIN;

-- ======================================================
-- 1. TABLA DE SESIONES
-- ======================================================

CREATE TABLE public.sesiones_pelicula (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES auth.users(id) ON DELETE CASCADE,

    nombre TEXT NOT NULL
        CHECK (
            char_length(btrim(nombre)) BETWEEN 1 AND 100
        ),

    tiempo_disponible INTEGER NOT NULL
        CHECK (tiempo_disponible BETWEEN 30 AND 600),

    duracion_total INTEGER NOT NULL
        CHECK (
            duracion_total > 0
            AND duracion_total <= tiempo_disponible
        ),

    creada_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ======================================================
-- 2. PELÍCULAS DE CADA SESIÓN
-- ======================================================

CREATE TABLE public.sesion_peliculas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    sesion_id UUID NOT NULL
        REFERENCES public.sesiones_pelicula(id)
        ON DELETE CASCADE,

    tmdb_id INTEGER NOT NULL
        CHECK (tmdb_id > 0),

    titulo TEXT NOT NULL
        CHECK (char_length(btrim(titulo)) > 0),

    poster_url TEXT,

    duracion_minutos INTEGER NOT NULL
        CHECK (duracion_minutos BETWEEN 1 AND 600),

    posicion INTEGER NOT NULL
        CHECK (posicion BETWEEN 1 AND 20),

    UNIQUE (sesion_id, tmdb_id),
    UNIQUE (sesion_id, posicion)
);

-- ======================================================
-- 3. ÍNDICES
-- ======================================================

CREATE INDEX idx_sesiones_usuario
ON public.sesiones_pelicula(user_id);

CREATE INDEX idx_sesion_peliculas_sesion
ON public.sesion_peliculas(sesion_id);

-- ======================================================
-- 4. HABILITAR RLS
-- ======================================================

ALTER TABLE public.sesiones_pelicula
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.sesion_peliculas
ENABLE ROW LEVEL SECURITY;

-- ======================================================
-- 5. POLÍTICAS DE LECTURA
-- ======================================================

CREATE POLICY "Usuarios leen sus sesiones"
ON public.sesiones_pelicula
FOR SELECT
TO authenticated
USING (
    user_id = (SELECT auth.uid())
);

CREATE POLICY "Usuarios leen peliculas de sus sesiones"
ON public.sesion_peliculas
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.sesiones_pelicula AS s
        WHERE s.id = sesion_id
          AND s.user_id = (SELECT auth.uid())
    )
);

-- ======================================================
-- 6. PRIVILEGIOS DEL CLIENTE
-- ======================================================

-- Retirar todos los privilegios directos y PUBLIC.
-- Esto incluye TRUNCATE, que no está sujeto a RLS.

REVOKE ALL
ON TABLE
    public.sesiones_pelicula,
    public.sesion_peliculas
FROM PUBLIC, anon, authenticated;

-- Los usuarios autenticados solo pueden leer.
-- RLS filtra las filas según el propietario.

GRANT SELECT
ON TABLE
    public.sesiones_pelicula,
    public.sesion_peliculas
TO authenticated;

-- ======================================================
-- 7. PRIVILEGIOS DEL SERVIDOR
-- ======================================================

-- La Edge Function utiliza service_role
-- exclusivamente desde el servidor.
--
-- La RPC necesita SELECT para las comprobaciones
-- y INSERT para crear las sesiones y películas.

GRANT SELECT, INSERT
ON TABLE
    public.sesiones_pelicula,
    public.sesion_peliculas
TO service_role;

-- No conceder INSERT, UPDATE ni DELETE
-- a anon o authenticated.

-- ======================================================
-- 8. VERIFICACIÓN DE POLÍTICAS
-- ======================================================

-- La aplicación podrá:
--
-- 1. Consultar sesiones propias.
-- 2. Consultar películas de sesiones propias.
-- 3. Conservar los datos históricos.
--
-- La aplicación NO podrá directamente:
--
-- 1. Crear sesiones.
-- 2. Modificar sesiones.
-- 3. Eliminar sesiones.
-- 4. Vaciar las tablas con TRUNCATE.
--
-- El guardado se realizará mediante la RPC
-- guardar_sesion_pelicula.
--
-- La Edge Function debe verificar:
-- - Autenticación del usuario.
-- - Pertenencia de las películas.
-- - Estado por_ver.
-- - Duraciones obtenidas desde TMDB.
-- - Tiempo disponible y pausas.

COMMIT;

-- ======================================================
-- MIGRACIÓN TERMINADA
-- ======================================================
