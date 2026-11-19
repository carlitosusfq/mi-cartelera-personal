
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function responder(
  datos: Record<string, unknown>,
  status = 200,
) {
  return new Response(JSON.stringify(datos), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (req.method !== 'POST') {
    return responder({ error: 'Método no permitido' }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceKey = Deno.env.get(
      'SUPABASE_SERVICE_ROLE_KEY',
    );
    const tmdbToken = Deno.env.get(
      'TMDB_READ_ACCESS_TOKEN',
    );

    if (
      !supabaseUrl ||
      !anonKey ||
      !serviceKey ||
      !tmdbToken
    ) {
      throw new Error('Configuración del servidor incompleta');
    }

    // 1. Verificar autenticación.
    const authorization = req.headers.get('Authorization');

    if (!authorization?.startsWith('Bearer ')) {
      return responder({ error: 'No autorizado' }, 401);
    }

    const token = authorization.slice(7);

    const supabaseUsuario = createClient(
      supabaseUrl,
      anonKey,
      {
        global: {
          headers: {
            Authorization: authorization,
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    const {
      data: { user },
      error: authError,
    } = await supabaseUsuario.auth.getUser(token);

    if (authError || !user) {
      return responder({ error: 'Sesión inválida' }, 401);
    }

    // 2. Validar los datos de entrada.
    const body = await req.json();

    const nombre = body?.nombre;
    const tiempo = body?.tiempo_disponible;
    const peliculas = body?.peliculas;

    if (
      typeof nombre !== 'string' ||
      nombre.trim().length < 1 ||
      nombre.trim().length > 100
    ) {
      return responder({ error: 'Nombre inválido' }, 400);
    }

    if (
      !Number.isInteger(tiempo) ||
      tiempo < 30 ||
      tiempo > 600
    ) {
      return responder({ error: 'Tiempo inválido' }, 400);
    }

    if (
      !Array.isArray(peliculas) ||
      peliculas.length < 1 ||
      peliculas.length > 20 ||
      !peliculas.every(
        (id: unknown) =>
          Number.isSafeInteger(id) &&
          (id as number) > 0 &&
          (id as number) <= 2147483647,
      )
    ) {
      return responder(
        { error: 'Lista de películas inválida' },
        400,
      );
    }

    const ids = peliculas as number[];

    if (new Set(ids).size !== ids.length) {
      return responder(
        { error: 'No se permiten películas duplicadas' },
        400,
      );
    }

    // 3. Consultar la colección del usuario.
    const { data: coleccion, error: errorColeccion } =
      await supabaseUsuario
        .from('mi_lista')
        .select('tmdb_id')
        .eq('user_id', user.id)
        .eq('tipo_contenido', 'pelicula')
        .eq('estado', 'por_ver')
        .in('tmdb_id', ids);

    if (errorColeccion) {
      throw errorColeccion;
    }

    const elegibles = new Set(
      (coleccion ?? []).map((p) => p.tmdb_id),
    );

    if (ids.some((id) => !elegibles.has(id))) {
      return responder(
        {
          error:
            'Una o más películas no pertenecen a tu lista por ver',
        },
        400,
      );
    }

    // 4. Obtener las duraciones desde TMDB.
    const peliculasVerificadas: {
      tmdb_id: number;
      duracion_minutos: number;
    }[] = [];

    let duracionTotal = 0;

    for (const id of ids) {
      const respuesta = await fetch(
        `https://api.themoviedb.org/3/movie/${id}?language=es-ES`,
        {
          headers: {
            Authorization: `Bearer ${tmdbToken}`,
            Accept: 'application/json',
          },
          signal: AbortSignal.timeout(10000),
        },
      );

      if (!respuesta.ok) {
        return responder(
          { error: `No se pudo consultar TMDB (${id})` },
          502,
        );
      }

      const detalle = await respuesta.json();
      const duracion = detalle.runtime;

      if (
        !Number.isInteger(duracion) ||
        duracion <= 0
      ) {
        return responder(
          {
            error: `La película ${id} no tiene duración válida`,
          },
          400,
        );
      }

      peliculasVerificadas.push({
        tmdb_id: id,
        duracion_minutos: duracion,
      });

      duracionTotal += duracion;
    }

    duracionTotal += 10 * (ids.length - 1);

    if (duracionTotal > tiempo) {
      return responder(
        {
          error:
            'Las películas superan el tiempo disponible',
        },
        400,
      );
    }

    // 5. Guardar mediante RPC privilegiada.
    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    const { data: sesionId, error: guardarError } =
      await supabaseAdmin.rpc('guardar_sesion_pelicula', {
        p_user_id: user.id,
        p_nombre: nombre.trim(),
        p_tiempo_disponible: tiempo,
        p_peliculas: peliculasVerificadas,
      });

    if (guardarError) {
      console.error('Error RPC:', guardarError.code);
      return responder(
        { error: 'No se pudo guardar la sesión' },
        500,
      );
    }

    return responder({
      mensaje: 'Sesión guardada correctamente',
      sesion_id: sesionId,
      duracion_total: duracionTotal,
    });
  } catch (error) {
    console.error('Error guardar-noche:', error);

    return responder(
      { error: 'Ocurrió un error al procesar la sesión' },
      500,
    );
  }
});
