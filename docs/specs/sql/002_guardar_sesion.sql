
-- ============================================================
-- E2-03: Guardado transaccional de Noche de película
-- Archivo: 002_guardar_sesion.sql
-- ESTADO: Pendiente de pruebas. NO EJECUTAR TODAVÍA.
-- ============================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.guardar_sesion_pelicula(
    p_user_id UUID,
    p_nombre TEXT,
    p_tiempo_disponible INTEGER,
    p_peliculas JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_sesion_id UUID;
    v_pelicula JSONB;
    v_tmdb_id INTEGER;
    v_duracion INTEGER;
    v_titulo TEXT;
    v_poster TEXT;
    v_total INTEGER := 0;
    v_cantidad INTEGER;
    v_posicion INTEGER := 0;
    v_ids INTEGER[] := ARRAY[]::INTEGER[];
BEGIN

    -- ========================================================
    -- 1. VALIDAR USUARIO
    -- ========================================================

    IF p_user_id IS NULL OR NOT EXISTS (
        SELECT 1
        FROM auth.users
        WHERE id = p_user_id
    ) THEN
        RAISE EXCEPTION 'Usuario no válido';
    END IF;


    -- ========================================================
    -- 2. VALIDAR NOMBRE
    -- ========================================================

    IF p_nombre IS NULL OR
       char_length(btrim(p_nombre)) NOT BETWEEN 1 AND 100
    THEN
        RAISE EXCEPTION 'Nombre de sesión inválido';
    END IF;


    -- ========================================================
    -- 3. VALIDAR TIEMPO DISPONIBLE
    -- ========================================================

    IF p_tiempo_disponible IS NULL OR
       p_tiempo_disponible NOT BETWEEN 30 AND 600
    THEN
        RAISE EXCEPTION 'Tiempo disponible inválido';
    END IF;


    -- ========================================================
    -- 4. VALIDAR LISTA DE PELÍCULAS
    -- ========================================================

    IF p_peliculas IS NULL OR
       jsonb_typeof(p_peliculas) IS DISTINCT FROM 'array'
    THEN
        RAISE EXCEPTION 'Lista de películas inválida';
    END IF;

    v_cantidad := jsonb_array_length(p_peliculas);

    IF v_cantidad < 1 OR v_cantidad > 20 THEN
        RAISE EXCEPTION
            'La sesión debe tener entre 1 y 20 películas';
    END IF;


    -- ========================================================
    -- 5. VALIDAR CADA PELÍCULA
    -- ========================================================

    FOR v_pelicula IN
        SELECT value
        FROM jsonb_array_elements(p_peliculas)
    LOOP

        -- Verificar estructura del objeto JSON.

        IF jsonb_typeof(v_pelicula) IS DISTINCT FROM 'object'
        THEN
            RAISE EXCEPTION 'Objeto de película inválido';
        END IF;

        -- Verificar existencia y tipo de los campos.

        IF jsonb_typeof(v_pelicula->'tmdb_id')
               IS DISTINCT FROM 'number'
           OR
           jsonb_typeof(v_pelicula->'duracion_minutos')
               IS DISTINCT FROM 'number'
        THEN
            RAISE EXCEPTION 'Datos de película inválidos';
        END IF;

        -- Solo se admiten números enteros positivos.

        IF (v_pelicula->>'tmdb_id') !~ '^[0-9]+$'
           OR
           (v_pelicula->>'duracion_minutos') !~ '^[0-9]+$'
        THEN
            RAISE EXCEPTION 'Valores numéricos inválidos';
        END IF;

        -- Limitar la longitud de los valores antes
        -- de convertirlos a INTEGER.

        IF length(v_pelicula->>'tmdb_id') > 10
           OR
           length(v_pelicula->>'duracion_minutos') > 3
        THEN
            RAISE EXCEPTION 'Valor numérico fuera de rango';
        END IF;

        -- Validar rango antes de convertir a INTEGER.

        IF (v_pelicula->>'tmdb_id')::NUMERIC
               NOT BETWEEN 1 AND 2147483647
           OR
           (v_pelicula->>'duracion_minutos')::NUMERIC
               NOT BETWEEN 1 AND 600
        THEN
            RAISE EXCEPTION 'ID o duración fuera de rango';
        END IF;

        v_tmdb_id :=
            (v_pelicula->>'tmdb_id')::INTEGER;

        v_duracion :=
            (v_pelicula->>'duracion_minutos')::INTEGER;

        -- ====================================================
        -- 6. RECHAZAR PELÍCULAS DUPLICADAS
        -- ====================================================

        IF v_tmdb_id = ANY(v_ids) THEN
            RAISE EXCEPTION
                'No se permiten películas duplicadas';
        END IF;

        v_ids := array_append(v_ids, v_tmdb_id);


        -- ====================================================
        -- 7. VERIFICAR PERTENENCIA A LA COLECCIÓN
        -- ====================================================

        PERFORM 1
        FROM public.mi_lista
        WHERE user_id = p_user_id
          AND tmdb_id = v_tmdb_id
          AND tipo_contenido = 'pelicula'
          AND estado = 'por_ver'
        FOR SHARE;

        IF NOT FOUND THEN
            RAISE EXCEPTION
                'Película no elegible: %', v_tmdb_id;
        END IF;


        -- ====================================================
        -- 8. ACUMULAR DURACIONES
        -- ====================================================

        v_total := v_total + v_duracion;

    END LOOP;


    -- ========================================================
    -- 9. CALCULAR PAUSAS
    -- ========================================================

    -- Se agregan 10 minutos entre películas.
    -- No hay pausa después de la última.

    v_total := v_total + 10 * (v_cantidad - 1);


    -- ========================================================
    -- 10. COMPROBAR TIEMPO DISPONIBLE
    -- ========================================================

    IF v_total > p_tiempo_disponible THEN
        RAISE EXCEPTION
            'La sesión supera el tiempo disponible';
    END IF;


    -- ========================================================
    -- 11. CREAR SESIÓN
    -- ========================================================

    INSERT INTO public.sesiones_pelicula (
        user_id,
        nombre,
        tiempo_disponible,
        duracion_total
    )
    VALUES (
        p_user_id,
        btrim(p_nombre),
        p_tiempo_disponible,
        v_total
    )
    RETURNING id INTO v_sesion_id;


    -- ========================================================
    -- 12. GUARDAR PELÍCULAS DE LA SESIÓN
    -- ========================================================

    FOR v_pelicula IN
        SELECT value
        FROM jsonb_array_elements(p_peliculas)
    LOOP

        v_posicion := v_posicion + 1;

        v_tmdb_id :=
            (v_pelicula->>'tmdb_id')::INTEGER;

        v_duracion :=
            (v_pelicula->>'duracion_minutos')::INTEGER;


        -- Obtener datos desde la colección.
        -- No confiar en títulos enviados por el cliente.

        SELECT titulo, poster_url
        INTO STRICT v_titulo, v_poster
        FROM public.mi_lista
        WHERE user_id = p_user_id
          AND tmdb_id = v_tmdb_id
          AND tipo_contenido = 'pelicula'
          AND estado = 'por_ver';


        INSERT INTO public.sesion_peliculas (
            sesion_id,
            tmdb_id,
            titulo,
            poster_url,
            duracion_minutos,
            posicion
        )
        VALUES (
            v_sesion_id,
            v_tmdb_id,
            v_titulo,
            v_poster,
            v_duracion,
            v_posicion
        );

    END LOOP;


    -- ========================================================
    -- 13. DEVOLVER SESIÓN CREADA
    -- ========================================================

    RETURN v_sesion_id;

END;
$$;


-- ============================================================
-- 14. SEGURIDAD DE LA FUNCIÓN RPC
-- ============================================================

-- Revocar acceso general y de clientes.

REVOKE ALL ON FUNCTION
public.guardar_sesion_pelicula(
    UUID, TEXT, INTEGER, JSONB
)
FROM PUBLIC, anon, authenticated;


-- Permitir ejecución al rol privilegiado
-- utilizado exclusivamente desde el servidor.

GRANT EXECUTE ON FUNCTION
public.guardar_sesion_pelicula(
    UUID, TEXT, INTEGER, JSONB
)
TO service_role;


COMMIT;


-- ============================================================
-- 15. CONSIDERACIONES DE SEGURIDAD
-- ============================================================

-- La función SECURITY DEFINER opera con
-- los permisos de su propietario.
--
-- La Edge Function debe:
--
-- 1. Autenticar al usuario mediante Supabase Auth.
-- 2. Obtener el identificador real del usuario.
-- 3. Validar los identificadores TMDB.
-- 4. Comprobar la colección del usuario.
-- 5. Consultar las duraciones reales desde TMDB.
-- 6. Rechazar películas sin duración válida.
-- 7. Invocar esta RPC con datos verificados.
--
-- Nunca enviar SUPABASE_SERVICE_ROLE_KEY
-- al navegador.
--
-- La función SQL valida las reglas de negocio
-- y realiza los INSERT en una misma transacción.
--
-- Las películas guardadas conservan una copia
-- histórica de sus datos.
--
-- No se modifican los estados de mi_lista.
--
-- No se crean permisos de escritura directa
-- para usuarios autenticados.
--
-- IMPORTANTE:
-- La restricción EXECUTE no sustituye la
-- seguridad de la Edge Function.
-- Verificar los permisos efectivos, el propietario
-- de la función y el flujo de autenticación.
--
-- Estado: pendiente de ejecución y pruebas.
-- ============================================================
