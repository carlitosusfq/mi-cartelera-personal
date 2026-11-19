
# PRD — Mi Cartelera Personal

## Producto
Mi Cartelera Personal

## Épicas
- E1: Colección personal de películas y series (Proyecto 3 existente).
- E2: Noche de película (nueva funcionalidad).

## Estado
Borrador — pendiente de completar y aprobar antes de implementar E2.

## Objetivo
Permitir que un usuario autenticado indique cuánto tiempo
tiene disponible, consulte qué películas de su lista
"por ver" caben en ese tiempo, construya una sesión
y la guarde para consultarla posteriormente.

## Problema

Los usuarios de Mi Cartelera Personal pueden guardar películas
que desean ver, pero cuando tienen un tiempo libre limitado
no saben cuáles de esas películas pueden terminar de ver.

Esto puede provocar que comiencen películas sin disponer
del tiempo suficiente para terminarlas.

## Usuarios

El usuario principal es una persona registrada en
Mi Cartelera Personal que tiene una colección privada
de películas y series.

Para utilizar Noche de película debe iniciar sesión
y tener películas guardadas en estado "por ver".

## Alcance del producto

### E1 — Colección personal (existente)

- Registro e inicio de sesión.
- Búsqueda de películas y series mediante TMDB.
- Administración de una colección personal.
- Estados: por ver, viendo y vista.
- Calificaciones y comentarios personales.
- Consulta, edición y eliminación de títulos.

### E2 — Noche de película (nueva)

- Acceder a la funcionalidad con sesión iniciada.
- Introducir un tiempo disponible entre 30 y 600 minutos.
- Consultar películas guardadas en estado "por ver".
- Obtener su duración desde TMDB.
- Mostrar qué películas pueden agregarse a una sesión.
- Agregar y quitar películas.
- Calcular duración total incluyendo pausas.
- Mostrar el tiempo restante.
- Guardar sesiones personales en Supabase.
- Consultar sesiones guardadas y sus detalles.
- Proteger los datos mediante políticas RLS.

## Fuera de alcance

- Incluir series en las sesiones.
- Ver películas con amigos.
- Compartir sesiones con otros usuarios.
- Enviar notificaciones o recordatorios.
- Sincronizar plataformas de streaming.
- Sincronizar calendarios externos.
- Recomendar películas que no estén en la colección.
- Reproducir películas desde la aplicación.

## Reglas de negocio

RN-01: Solo usuarios autenticados pueden acceder a E2.

RN-02: El tiempo disponible debe ser un número entero
entre 30 y 600 minutos, inclusive.

RN-03: Solo se pueden seleccionar películas de la
colección del usuario con estado "por_ver".

RN-04: La duración de las películas se obtiene desde TMDB.

RN-05: Una película sin duración conocida no puede
agregarse a la sesión y debe mostrarse el motivo.

RN-06: Entre dos películas consecutivas se agrega
una pausa de 10 minutos.

RN-07: No existe pausa antes de la primera película
ni después de la última.

RN-08: La suma de las duraciones y las pausas
no puede superar el tiempo disponible.

RN-09: Se permite utilizar exactamente el tiempo
disponible, sin dejar minutos restantes.

RN-10: El usuario puede agregar o quitar películas
antes de guardar la sesión.

RN-11: Guardar una sesión no modifica el estado
de visualización de las películas.

RN-12: Las sesiones se almacenan asociadas
al usuario autenticado y protegidas mediante RLS.

## Decisiones propuestas del cliente

D-01: Una película puede aparecer en varias sesiones.
Justificación: una sesión es un plan independiente y
no necesariamente significa que se vio la película.

D-02: Las películas disponibles se mostrarán
ordenadas alfabéticamente por título.
Justificación: facilita encontrar una película.

D-03: Una sesión guardada será de solo lectura.
Justificación: reduce la complejidad y conserva
el plan original del usuario.

D-04: Si se elimina una película de la colección,
la sesión guardada conserva una copia de sus datos.
Justificación: permite consultar sesiones históricas
sin depender del registro original.

D-05: Cada sesión tendrá un nombre ingresado por
el usuario y una fecha de creación automática.
Justificación: facilita identificar sesiones guardadas.

Estas cinco decisiones deberán validarse y reflejarse
en los criterios de aceptación y en las specs.

## Supuestos

S-01: TMDB proporciona la duración para las películas
que tienen ese dato registrado.

S-02: Los usuarios disponen de una cuenta válida
de Supabase Auth.

S-03: El Proyecto 3 debe conservar su funcionalidad.

S-04: Las sesiones no representan necesariamente
películas que el usuario haya terminado de ver.

## Puntos abiertos

- Confirmar las cinco decisiones propuestas.
- Definir los criterios de validación del nombre.
- Especificar el comportamiento ante fallos de TMDB.
- Definir la estructura SQL de sesiones y sus películas.
- Detallar las políticas RLS en la spec.
- Precisar la presentación de errores y estados vacíos.
- Verificar la integración de Bootstrap.

## Restricciones de implementación

Las reglas del dominio se implementarán en funciones
puras de src/dominio/, con pruebas Vitest.

Los componentes React utilizarán servicios separados
para comunicarse con TMDB y Supabase.

El diseño seguirá DESIGN.md y la nueva interfaz
será coherente con Bootstrap.

La implementación solo comenzará después de completar
y revisar el backlog y las especificaciones de E2.
