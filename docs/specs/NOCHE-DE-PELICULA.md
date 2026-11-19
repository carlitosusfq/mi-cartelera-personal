
# Spec E2 — Noche de película

## 1. Estado

Versión: 1.0
Estado: Borrador para revisión.
Épica: E2 — Noche de película.

Documentos relacionados:
- docs/prd/PRD.md
- docs/backlog/HISTORIAS.md
- docs/backlog/REFINAMIENTO.md
- docs/backlog/TICKETS.md
- DESIGN.md

No implementar código antes de aprobar esta especificación.

## 2. Objetivo técnico

Incorporar la funcionalidad Noche de película
a Mi Cartelera Personal sin reescribir el Proyecto 3.

El usuario autenticado podrá indicar su tiempo libre,
consultar películas pendientes, crear una sesión
y guardarla en Supabase para futuras consultas.

## 3. Reglas del dominio

### Tiempo disponible

- Debe ser un número entero entre 30 y 600 minutos.
- Los valores 30 y 600 están permitidos.
- No se aceptan valores vacíos, negativos o decimales.

### Películas elegibles

- Deben pertenecer a la colección del usuario.
- Su tipo_contenido debe ser "pelicula".
- Su estado debe ser "por_ver".
- La duración se obtiene de TMDB mediante runtime.
- Una duración desconocida, nula o menor o igual a cero
  impide agregar la película.

### Pausas

- La pausa dura exactamente 10 minutos.
- No hay pausa antes de la primera película.
- No hay pausa después de la última.
- Una sesión de una película no tiene pausas.

### Cálculo de duración

Para N películas seleccionadas:

total = suma de duraciones + 10 * max(0, N - 1)

Una película cabe cuando:

totalConNuevaPelicula <= tiempoDisponible

Si el resultado es exactamente igual al tiempo
disponible, la película puede agregarse.

### Restricciones de sesión

- No se permiten películas duplicadas dentro
  de una misma sesión.
- No se permite guardar una sesión vacía.
- El usuario puede quitar películas antes de guardar.
- Guardar no modifica los estados de la colección.
- Una película puede aparecer en sesiones diferentes.
- Las sesiones guardadas son de solo lectura.

## 4. Integración con TMDB

Se reutilizará el servicio existente:

src/services/tmdb.ts

La función obtenerDetalles() consulta:

GET /movie/{tmdb_id}

La interfaz DetalleTMDB deberá incorporar
el campo runtime como number | null.

La duración debe validarse antes de utilizarla.

La aplicación mostrará estados de carga y error
y permitirá reintentar consultas fallidas.

## 5. Separación de responsabilidades

### Dominio

Ubicación: src/dominio/

Responsabilidad:
- Validación del tiempo.
- Cálculo de duración y pausas.
- Evaluación de si una película cabe.
- Validación de sesiones.

No puede consultar redes, TMDB ni Supabase.

### Servicios

Ubicación: src/services/

Responsabilidad:
- Consultar TMDB.
- Obtener películas elegibles desde Supabase.
- Guardar y consultar sesiones del usuario.

### Componentes

Ubicación: src/components/

Responsabilidad:
- Mostrar información.
- Recibir acciones del usuario.
- Presentar errores y estados de carga.
- Utilizar servicios y funciones del dominio.

Los componentes nuevos no realizarán
consultas directas a TMDB ni Supabase.

## 6. Interfaz de usuario

La pantalla Noche de película estará disponible
únicamente con una sesión autenticada.

Deberá incluir:

- Campo numérico de tiempo disponible.
- Lista de películas elegibles.
- Duración individual de cada película.
- Mensajes para duraciones desconocidas.
- Selección y eliminación de películas.
- Duración total incluyendo pausas.
- Tiempo restante.
- Validación cuando una película no cabe.
- Campo para nombrar la sesión.
- Botón para guardar.
- Historial de sesiones guardadas.
- Detalle de cada sesión.

La interfaz deberá seguir DESIGN.md
y ser coherente con Bootstrap.

## 7. Seguridad

- Cada sesión pertenece a un user_id.
- Se utilizará Supabase Auth.
- Las tablas de sesiones tendrán RLS habilitado.
- Un usuario solo podrá consultar sus sesiones.
- Un usuario no podrá insertar sesiones para otro.
- Las operaciones de modificación deberán
  respetar el propietario autenticado.
- Las claves privadas nunca se incluirán
  en el código del frontend.

La seguridad se verificará con dos cuentas.

## 8. Verificaciones

- Pruebas Vitest del dominio.
- Validación de límites 30 y 600.
- Sesión que ocupa exactamente el tiempo.
- Una sola película sin pausa.
- Película sin duración.
- Película que no cabe.
- Sesión vacía.
- Intento de duplicación.
- Validación de privacidad mediante RLS.
- Compilación TypeScript y Vite.
- Revisión ESLint.
- Pruebas manuales en navegador.

## 9. Pendientes de especificación

- Definir modelo de datos SQL y migración.
- Precisar políticas RLS.
- Definir firmas de funciones puras.
- Especificar los servicios y sus contratos.
- Establecer los componentes y sus propiedades.
- Crear matriz criterio-verificación.
- Crear matriz ticket-archivos.
- Resolver las decisiones pendientes del cliente.


## 10. Modelo de datos propuesto

La épica E2 incorpora dos tablas nuevas en Supabase.

### Tabla sesiones_pelicula

Representa una sesión creada por un usuario.

| Campo | Tipo | Restricción |
|---|---|---|
| id | uuid | PK, generado automáticamente |
| user_id | uuid | FK a auth.users, obligatorio |
| nombre | text | Obligatorio, 1 a 100 caracteres |
| tiempo_disponible | integer | Entre 30 y 600 |
| duracion_total | integer | Mayor que 0 y no superior al tiempo |
| creada_en | timestamptz | Fecha automática |

### Tabla sesion_peliculas

Representa las películas incluidas en una sesión.

| Campo | Tipo | Restricción |
|---|---|---|
| id | uuid | PK, generado automáticamente |
| sesion_id | uuid | FK a sesiones_pelicula |
| tmdb_id | integer | ID de TMDB, obligatorio |
| titulo | text | Obligatorio |
| poster_url | text | Opcional |
| duracion_minutos | integer | Mayor que 0 |
| posicion | integer | Mayor o igual a 1 |

### Relaciones

Una sesión puede contener varias películas.

Cada película seleccionada pertenece a una única
sesión mediante sesion_id.

Una misma película de TMDB puede aparecer en sesiones
diferentes, pero solo una vez dentro de la misma sesión.

Se propone una restricción UNIQUE(sesion_id, tmdb_id).

### Persistencia histórica

Los datos de las películas se almacenan como una
copia del momento de creación de la sesión.

Las películas guardadas no dependen de una relación
obligatoria con la tabla mi_lista.

Eliminar un título de mi_lista no elimina sus datos
de las sesiones guardadas.

### Integridad

La migración SQL deberá incluir:

- Claves primarias.
- Claves foráneas.
- Restricciones NOT NULL.
- Validaciones CHECK.
- Restricción de películas duplicadas.
- Índices necesarios.
- Políticas RLS.

El guardado de la sesión y sus películas deberá
ser atómico para evitar sesiones incompletas.

La validación de tiempo, duración total, pertenencia
de películas y cantidad mínima deberá realizarse
también de forma segura en la base de datos.

Las políticas RLS deberán impedir el acceso
a datos de otros usuarios.

### Estado

Diseño propuesto, todavía no implementado.

La migración SQL se definirá y revisará antes
de modificar la base de datos de producción.


## 11. Guardado atómico de sesiones

### Objetivo

Guardar una sesión y todas sus películas mediante
una única operación transaccional en PostgreSQL.

### Operación propuesta

Nombre: guardar_sesion_pelicula

Entrada:
- Nombre de la sesión.
- Tiempo disponible.
- Lista ordenada de películas.
- ID de TMDB, título, póster y duración de cada película.

El user_id no será proporcionado por el frontend.
Se obtendrá mediante auth.uid() en PostgreSQL.

### Validaciones obligatorias

La función deberá comprobar:

1. Que exista un usuario autenticado.
2. Que el nombre tenga entre 1 y 100 caracteres.
3. Que el tiempo sea un entero entre 30 y 600.
4. Que exista al menos una película.
5. Que cada película tenga un ID TMDB válido.
6. Que cada duración sea mayor que cero.
7. Que no existan películas duplicadas.
8. Que se incluyan 10 minutos entre películas.
9. Que la duración total no exceda el tiempo.
10. Que las películas correspondan a títulos
    elegibles de la colección del usuario.

### Transacción

Si todas las validaciones son correctas:

1. Crear la sesión.
2. Guardar las películas y sus posiciones.
3. Devolver el identificador de la sesión.

Si cualquier paso falla, toda la operación
deberá revertirse, sin registros parciales.

### Seguridad

La función deberá definir permisos mínimos.

Si utiliza SECURITY DEFINER:
- Fijará explícitamente un search_path seguro.
- Validará auth.uid().
- Verificará la propiedad de cada película.
- No permitirá escoger user_id.
- Restringirá los permisos EXECUTE.
- Evitará modificaciones a sesiones existentes.

### Limitación de confianza

El frontend no es una fuente confiable para
validar la duración oficial de una película.

La validación exacta contra TMDB deberá realizarse
mediante un mecanismo confiable o documentarse
como limitación si solo se reciben datos del cliente.

### Estado

Diseño pendiente de implementación y pruebas.

No ejecutar SQL hasta completar y revisar
las políticas, la función y sus permisos.


## 12. Contratos de las funciones del dominio

Las funciones se implementarán en src/dominio/.
Serán funciones puras, sin acceso a TMDB, Supabase,
React, almacenamiento local ni efectos secundarios.

### Tipos compartidos

PeliculaSesion:
- tmdbId: number
- titulo: string
- duracionMinutos: number

### validarTiempo

Firma:
validarTiempo(valor: number): boolean

Comportamiento:
- Devuelve true para enteros entre 30 y 600.
- Devuelve false para decimales, valores fuera de rango,
  NaN e Infinity.

Casos:
- 30 → true
- 600 → true
- 29 → false
- 601 → false
- 120.5 → false
- NaN → false

### calcularDuracionTotal

Firma:
calcularDuracionTotal(
  duraciones: number[],
  pausaMinutos?: number
): number

Comportamiento:
- Suma las duraciones de todas las películas.
- Agrega 10 minutos entre películas por defecto.
- No agrega pausas al inicio ni al final.
- Para una lista vacía devuelve 0.
- Exige duraciones enteras positivas.
- Una entrada inválida produce un error controlado.

Ejemplos:
- [] → 0
- [120] → 120
- [120, 90] → 220
- [100, 80, 60] → 260

### puedeAgregarPelicula

Firma:
puedeAgregarPelicula(
  duracionesActuales: number[],
  nuevaDuracion: number,
  tiempoDisponible: number
): boolean

Comportamiento:
- Valida el tiempo disponible.
- Valida la nueva duración.
- Calcula el total incluyendo la película propuesta.
- Devuelve true si el total es menor o igual al límite.
- Devuelve false cuando no cabe o los datos son inválidos.
- No modifica la lista recibida.

Ejemplos:
- Tiempo 120, actuales [], nueva 120 → true
- Tiempo 120, actuales [60], nueva 50 → true
- Tiempo 120, actuales [60], nueva 51 → false

### validarSesion

Firma:
validarSesion(
  peliculas: PeliculaSesion[],
  tiempoDisponible: number
): boolean

Comportamiento:
- Verifica que el tiempo disponible sea válido.
- Rechaza sesiones vacías.
- Verifica IDs TMDB enteros positivos.
- Rechaza películas duplicadas.
- Exige títulos no vacíos.
- Exige duraciones enteras positivas.
- Calcula las pausas entre películas.
- Rechaza sesiones que exceden el tiempo disponible.
- Permite sesiones que ocupan exactamente el límite.
- No modifica el arreglo de películas.

### Pruebas obligatorias con Vitest

- Tiempo mínimo de 30 minutos.
- Tiempo máximo de 600 minutos.
- Tiempo menor o mayor al rango.
- Tiempo decimal.
- Sesión sin películas.
- Una película sin pausas.
- Dos películas con una pausa.
- Tres películas con dos pausas.
- Sesión que ocupa exactamente el tiempo disponible.
- Película que excede el tiempo restante.
- Duración cero, negativa o desconocida.
- Identificadores de película duplicados.
- Datos inválidos.

### Criterio de aceptación técnico

Las funciones deben funcionar sin conexión a internet,
sin credenciales y sin una base de datos.

Su comportamiento debe verificarse mediante Vitest
antes de integrarlas con los componentes React.


## 13. Contratos de servicios

Los servicios serán responsables de comunicarse con
TMDB y Supabase. Los componentes React no realizarán
consultas directas a estas plataformas.

### Servicio de TMDB

Archivo: src/services/tmdb.ts

Función existente:
obtenerDetalles(tmdbId, tipo)

Cambio previsto:
Incorporar runtime?: number | null a DetalleTMDB.

El servicio deberá gestionar:
- Respuestas exitosas.
- Películas sin duración.
- Errores de conexión.
- Errores HTTP.
- Solicitudes fallidas.

### Servicio de colección elegible

Archivo previsto:
src/services/peliculasElegibles.ts

Responsabilidad:
- Obtener el usuario autenticado.
- Consultar sus títulos de mi_lista.
- Filtrar películas con estado por_ver.
- Excluir series.
- Consultar la duración de las películas.
- Devolver resultados con estados disponibles,
  no disponibles o con error.

### Servicio de sesiones

Archivo previsto:
src/services/sesionesPelicula.ts

Funciones previstas:
- guardarSesion()
- obtenerSesiones()
- obtenerDetalleSesion()

Responsabilidad:
- Guardar una sesión mediante una operación
  transaccional segura.
- Consultar únicamente sesiones del usuario.
- Obtener el detalle histórico de una sesión.
- Gestionar errores de Supabase.

No se enviará un user_id arbitrario desde el frontend
para determinar el propietario de una sesión.

## 14. Componentes de interfaz

### NocheDePelicula

Archivo:
src/components/NocheDePelicula.tsx

Responsabilidad:
- Coordinar la funcionalidad.
- Administrar el tiempo indicado.
- Mostrar películas elegibles.
- Controlar la selección.
- Mostrar las sesiones guardadas.

### SelectorPeliculas

Archivo:
src/components/SelectorPeliculas.tsx

Responsabilidad:
- Mostrar películas por ver.
- Mostrar duraciones.
- Permitir seleccionar películas que caben.
- Explicar por qué una película no está disponible.

### ResumenSesion

Archivo:
src/components/ResumenSesion.tsx

Responsabilidad:
- Mostrar las películas seleccionadas.
- Mostrar pausas.
- Mostrar duración total y tiempo restante.
- Permitir quitar películas.
- Mostrar la acción de guardar.

### HistorialSesiones

Archivo:
src/components/HistorialSesiones.tsx

Responsabilidad:
- Mostrar sesiones guardadas.
- Mostrar nombre y fecha.
- Permitir consultar sus detalles.
- Mantener las sesiones en modo solo lectura.

### Integración con App.tsx

La pantalla Noche de película será accesible
únicamente después de iniciar sesión.

Se conservarán los componentes originales
BuscadorTMDB y MiColeccion.

El diseño seguirá DESIGN.md.

La nueva interfaz utilizará Bootstrap con
personalizaciones visuales documentadas.

## 15. Estados de interfaz

Cada consulta tendrá estados definidos:

- Cargando: solicitud en curso.
- Éxito: información disponible.
- Vacío: no existen resultados.
- Error: solicitud fallida.
- No disponible: falta duración u otro requisito.

Los mensajes deben ser comprensibles para el usuario.

Un error de TMDB no debe provocar que se pierda
la selección actual de películas.

## 16. Seguridad e integración

El servicio de sesiones utilizará Supabase Auth
y las políticas RLS correspondientes.

El guardado deberá realizarse de forma atómica.

Las políticas directas de INSERT de la migración
inicial deberán revisarse y restringirse antes
de ejecutar la migración en Supabase.

No se utilizarán claves de servicio privilegiadas
en el frontend.

La seguridad se comprobará con dos usuarios
diferentes antes de considerar terminado E2-03.

Estado: pendiente de implementación y verificación.



## 17. Matriz de criterios y verificación

| Criterio | Verificación prevista |
|---|---|
| CA-01 | Validar tiempo entre 30 y 600 minutos |
| CA-02 | Rechazar tiempo inválido |
| CA-03 | Mostrar películas elegibles por ver |
| CA-04 | Mostrar motivo de duración desconocida |
| CA-05 | Excluir series y títulos en otros estados |
| CA-06 | Mostrar error de consulta externa |
| CA-07 | Agregar y quitar películas de una sesión |
| CA-08 | Calcular pausas entre películas |
| CA-09 | Impedir agregar una película que no cabe |
| CA-10 | Permitir ocupar exactamente el tiempo |
| CA-11 | Impedir duplicados dentro de una sesión |
| CA-12 | Validar cambios del tiempo disponible |
| CA-13 | Guardar una sesión válida |
| CA-14 | Rechazar un guardado inválido |
| CA-15 | Conservar los estados de la colección |
| CA-16 | Consultar listado y detalle de sesiones |
| CA-17 | Verificar conservación de datos históricos |
| CA-18 | Verificar privacidad entre dos usuarios |
| CA-19 | Comprobar sesiones de solo lectura |
| CA-20 | Mostrar mensaje cuando no existen sesiones guardadas |


Los resultados reales se registrarán en
docs/VERIFICACION.md durante el Checkpoint 3.

Cada criterio deberá tener evidencia de su
resultado y el ticket responsable.

## 18. Matriz de tickets y archivos

| Ticket | Archivos previstos |
|---|---|
| E2-01 | src/dominio/ y archivos de pruebas Vitest |
| E2-02 | src/services/peliculasElegibles.ts, src/services/tmdb.ts |
| E2-03 | docs/specs/sql/001_sesiones_pelicula.sql y función RPC |
| E2-04 | NocheDePelicula.tsx, SelectorPeliculas.tsx, ResumenSesion.tsx, App.tsx |
| E2-05 | src/services/sesionesPelicula.ts, ResumenSesion.tsx |
| E2-06 | HistorialSesiones.tsx, sesionesPelicula.ts |
| E2-07 | docs/VERIFICACION.md, pruebas y evidencias |

Los archivos son una propuesta.
La lista definitiva se verificará antes de implementar.

## 19. Condiciones para comenzar la implementación

Antes de escribir código de E2 se deberá:

- Aprobar las decisiones del PRD.
- Confirmar los criterios de aceptación definitivos.
- Revisar las políticas RLS.
- Completar el diseño de guardado atómico.
- Revisar los permisos de la función SQL.
- Confirmar la integración de Bootstrap.
- Completar y revisar esta especificación.

Estado actual: borrador no aprobado.

## 20. Compatibilidad con la base de datos existente

Se verificó la estructura de public.mi_lista
mediante consultas de solo lectura en Supabase.

### Campos relevantes

- id: bigint, obligatorio.
- user_id: uuid, obligatorio.
- tmdb_id: integer, obligatorio.
- titulo: text, obligatorio.
- poster_url: text, opcional.
- tipo_contenido: text, obligatorio.
- estado: text, obligatorio.
- fecha_agregado: timestamptz, obligatorio.

### Restricciones confirmadas

- Estado permitido: por_ver, viendo, vista.
- Tipo permitido: pelicula, serie.
- Calificación personal: entre 1 y 5.
- user_id referencia auth.users(id).
- La relación con usuarios utiliza ON DELETE CASCADE.
- Existe UNIQUE(user_id, tmdb_id, tipo_contenido).

### Decisión de integración

La épica E2 reutilizará la tabla mi_lista
sin modificar su estructura.

Para seleccionar películas elegibles se utilizarán:

- user_id del usuario autenticado.
- tipo_contenido = 'pelicula'.
- estado = 'por_ver'.

El campo tmdb_id permitirá consultar la duración.

El guardado de sesiones no modificará mi_lista.

### Estado

Estructura y restricciones verificadas en Supabase.

Pendiente:
- Revisar las políticas RLS de mi_lista.
- Completar la función RPC.
- Implementar y verificar las tablas nuevas.


## 21. Verificación segura de las duraciones

### Problema

El navegador consulta TMDB para obtener runtime,
pero los datos enviados por el cliente pueden alterarse.

Por tanto, la función RPC no debe considerar
confiable una duración solo porque el frontend
la haya proporcionado.

### Decisión de arquitectura

Se propone utilizar una función de servidor
que consulte TMDB y verifique las duraciones
antes de persistir la sesión.

El flujo será:

1. El usuario selecciona las películas.
2. El frontend envía los identificadores TMDB,
   el nombre y el tiempo disponible.
3. El servidor identifica al usuario autenticado.
4. El servidor verifica que las películas estén
   en mi_lista con estado por_ver.
5. El servidor consulta sus duraciones en TMDB.
6. Calcula el total incluyendo pausas.
7. Si el total es válido, invoca la operación
   transaccional de PostgreSQL.
8. PostgreSQL guarda la sesión y sus películas.
9. El frontend recibe la confirmación.

### Seguridad

- La clave privada de TMDB, si se utiliza una,
  permanece exclusivamente en el servidor.
- El cliente no puede seleccionar un user_id arbitrario.
- PostgreSQL valida la identidad del usuario.
- Se rechazan sesiones vacías y duplicados.
- No se confía en duraciones enviadas por el navegador.
- La operación de persistencia es atómica.
- RLS protege la consulta de las sesiones.

### Pendientes

- Elegir y configurar el entorno de ejecución
  de la función de servidor.
- Definir la comunicación autenticada.
- Completar la función RPC.
- Revisar permisos de ejecución.
- Realizar pruebas con dos cuentas.

Estado: diseño propuesto, pendiente de implementación.

## 22. Arquitectura definitiva de persistencia

### Decisión

El guardado utilizará una Supabase Edge Function
como punto de entrada para el frontend.

La función verificará la identidad del usuario
utilizando su token de autenticación.

El frontend enviará:
- Nombre de la sesión.
- Tiempo disponible.
- Lista ordenada de identificadores TMDB.

El frontend NO enviará duraciones confiables,
user_id ni totales calculados como autoridad.

### Validación en servidor

La Edge Function deberá:

1. Verificar la autenticación del usuario.
2. Consultar su colección en Supabase.
3. Verificar estado por_ver y tipo pelicula.
4. Consultar runtime desde TMDB.
5. Rechazar duraciones desconocidas.
6. Rechazar identificadores duplicados.
7. Calcular duración total y pausas.
8. Rechazar sesiones que excedan el tiempo.
9. Invocar una operación transaccional de PostgreSQL.

### Persistencia

La operación PostgreSQL deberá:

- Recibir datos validados por el servidor.
- Crear la sesión y sus películas atómicamente.
- Asociar la sesión al usuario autenticado.
- Devolver el UUID de la sesión creada.
- Rechazar llamadas no autorizadas.

### Seguridad

- La clave de TMDB para servidor permanecerá
  en los secretos de la Edge Function.
- No se enviarán claves de servicio al navegador.
- El frontend no podrá insertar directamente
  en sesiones_pelicula ni sesion_peliculas.
- Las consultas de lectura utilizarán RLS.
- La operación transaccional no estará expuesta
  directamente a usuarios autenticados.
- Se comprobará el aislamiento entre usuarios.

### Pendiente de implementación

- Configurar la Edge Function.
- Implementar la operación PostgreSQL.
- Establecer permisos seguros.
- Ejecutar pruebas de autorización.
- Verificar errores y transacciones.

Esta decisión sustituye las alternativas
provisionales anteriores.


## 23. Verificación de RLS del Proyecto 3

Se consultaron las políticas de public.mi_lista
mediante pg_policies en Supabase.

Se identificaron cuatro políticas para el rol
authenticated:

- SELECT: Ver mis títulos.
- INSERT: Agregar mis títulos.
- UPDATE: Editar mis títulos.
- DELETE: Eliminar mis títulos.

Todas utilizan una condición relacionada con
auth.uid() y user_id.

Las políticas SELECT, UPDATE y DELETE restringen
el acceso mediante la identidad del usuario.

La política INSERT verifica que el nuevo registro
pertenezca al usuario autenticado.

### Decisión

No modificar las políticas existentes de mi_lista.

La épica E2 utilizará estas restricciones y
añadirá sus propias políticas para las nuevas tablas.

### Verificación pendiente

Comprobar que RLS esté habilitado y realizar
pruebas reales con dos cuentas independientes.


### Resultado de la verificación de RLS

Se ejecutó una consulta a pg_class para verificar
la propiedad relrowsecurity de public.mi_lista.

Resultado obtenido:
- Tabla: mi_lista
- RLS habilitado: true

Conclusión:
Se confirmó que RLS está activado y que existen
cuatro políticas asociadas a auth.uid().

La configuración de seguridad existente se conservará
sin modificaciones durante la implementación de E2.

Pendiente: comprobar el aislamiento real con dos cuentas.
