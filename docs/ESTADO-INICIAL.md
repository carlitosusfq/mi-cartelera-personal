
# Estado inicial — Mi Cartelera Personal

## 1. Descripción general

Mi Cartelera Personal es una aplicación web desarrollada
con React, TypeScript y Vite que permite a los usuarios
buscar películas y series, administrar una colección
personal y registrar su estado de visualización.

La aplicación utiliza TMDB para consultar información
de títulos y Supabase para autenticación y almacenamiento.

Este documento describe el estado del Proyecto 3 antes
de implementar la épica E2: Noche de película.

## 2. Tecnologías identificadas

- React y TypeScript: interfaz y lógica de componentes.
- Vite: desarrollo y compilación.
- Supabase Auth: autenticación de usuarios.
- Supabase PostgreSQL: almacenamiento de colecciones.
- TMDB: búsqueda y detalles de películas y series.
- CSS: estilos de la aplicación.
- Git y GitHub: control de versiones.

Bootstrap se menciona como tecnología del Proyecto 3
en la consigna, pero su uso debe comprobarse en el código.

## 3. Estructura existente

- src/App.tsx: autenticación y pantalla principal.
- src/components/BuscadorTMDB.tsx: búsqueda de títulos.
- src/components/MiColeccion.tsx: colección personal.
- src/components/DetalleTitulo.tsx: detalles de títulos.
- src/lib/supabaseClient.ts: cliente de Supabase.
- src/services/tmdb.ts: funciones de consulta a TMDB.
- src/App.css e index.css: estilos.

## 4. Funcionalidades existentes

### Autenticación

La aplicación permite registrar usuarios, iniciar sesión
y cerrar sesión utilizando Supabase Auth.

Al iniciar la aplicación, consulta la sesión existente
y escucha los cambios de autenticación.

Sin una sesión iniciada, se muestra el formulario
de autenticación.

### Colección personal

La colección permite:

- Consultar títulos guardados por el usuario.
- Filtrar por los estados por_ver, viendo y vista.
- Ordenar por fecha o calificación.
- Editar estados, calificaciones y comentarios.
- Eliminar títulos.
- Mostrar contadores por estado.

Las operaciones observadas en MiColeccion.tsx
incluyen filtros por user_id.

### Integración con TMDB

El servicio tmdb.ts permite:

- Buscar películas y series.
- Obtener las URL de los pósteres.
- Consultar información detallada de títulos.

La interfaz DetalleTMDB todavía no declara runtime,
campo necesario para la nueva épica.

## 5. Verificaciones realizadas

- Git: rama main sincronizada inicialmente con origin/main.
- Estado inicial de Git: limpio antes del nuevo trabajo.
- Node.js: versión 24.19.0.
- npm: versión 11.17.0.
- Compilación: npm.cmd run build completado correctamente.
- Vite: versión 8.3.4.
- Compilación observada: 65 módulos transformados.
- Supabase: aplicación recuperó funcionamiento después
  de una incidencia de conexión.
- Prettier: versión 3.10.0 instalada.
- Hook de formato: script probado manualmente.

La integración automática del hook con Claude Code
y la ejecución de la skill /commit siguen pendientes.

## 6. Riesgos e inconsistencias

### R-01: Posible carga indefinida de autenticación

App.tsx utiliza supabase.auth.getSession().then(),
pero no maneja explícitamente el rechazo de la promesa.

Si ocurre un error de red, cargandoSesion podría
permanecer activo.

### R-02: Consultas de Supabase dentro de componentes

MiColeccion.tsx realiza consultas, actualizaciones
y eliminaciones directamente desde el componente.

La nueva épica deberá separar servicios y componentes.

### R-03: Tipos locales

La interfaz TituloGuardado está definida dentro de
MiColeccion.tsx, lo que dificulta reutilizarla.

### R-04: Sin duración en el modelo TMDB

DetalleTMDB no declara el campo runtime.
La nueva épica necesitará consultar este dato.

### R-05: Dependencia de servicios externos

La autenticación y consulta de películas dependen
de la disponibilidad de Supabase y TMDB.

### R-06: Advertencias de dependencias

Después de instalar Prettier, npm reportó
10 vulnerabilidades de severidad moderada.

Se requiere ejecutar npm audit para identificar
las dependencias afectadas antes de corregirlas.

### R-07: Seguridad pendiente de comprobación

Las consultas observadas filtran por user_id,
pero no se han auditado las políticas RLS
de Supabase con dos cuentas diferentes.

### R-08: Pruebas automatizadas

No se han identificado todavía pruebas Vitest
del Proyecto 3. Su ausencia debe comprobarse.

### R-09: Problemas de ESLint en MiColeccion.tsx

Se ejecutó `npm.cmd run lint` durante la revisión
del estado inicial del Proyecto 3.

Resultado: 1 error y 1 advertencia.

Error:
- Archivo: src/components/MiColeccion.tsx
- Línea: 82
- Regla: react-hooks/set-state-in-effect
- Descripción: posible actualización de estado
  durante la ejecución de useEffect.

Advertencia:
- Archivo: src/components/MiColeccion.tsx
- Línea: 83
- Regla: react-hooks/exhaustive-deps
- Descripción: dependencia cargarColeccion
  no declarada en useEffect.

Estos problemas ya estaban presentes en el
código revisado del Proyecto 3.

Decisión:
Registrar como deuda técnica heredada.
No corregir durante el Checkpoint 1 para
conservar el estado original de la aplicación.

Verificación:
- npm.cmd run build: exitoso.
- npm.cmd run lint: no exitoso.

## 7. Deuda técnica pendiente

- Revisar el manejo de errores de autenticación.
- Evaluar la extracción de servicios de Supabase.
- Considerar centralizar tipos compartidos.
- Verificar políticas RLS.
- Revisar dependencias con npm audit.
- Comprobar las pruebas automatizadas existentes.
- Confirmar el uso de Bootstrap.
- Revisar los componentes BuscadorTMDB y DetalleTitulo.

Estas tareas se registran sin corregirse durante
el análisis del estado inicial.

## 8. Restricciones para la nueva épica

- No reescribir el Proyecto 3.
- Conservar las funcionalidades existentes.
- Usar solamente películas por ver para las sesiones.
- Consultar la duración mediante TMDB.
- Implementar las reglas de tiempo en funciones puras.
- Guardar las sesiones por usuario en Supabase.
- Aplicar políticas RLS.
- Respetar el diseño existente.

## 9. Pendientes de revisión

- Revisar el código completo de BuscadorTMDB.tsx.
- Revisar el código completo de DetalleTitulo.tsx.
- Comprobar la configuración de Bootstrap.
- Revisar la estructura real de la tabla mi_lista.
- Confirmar las políticas RLS actuales.
- Ejecutar npm audit sin modificar dependencias.
