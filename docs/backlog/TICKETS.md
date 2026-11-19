
# Tickets — Épica E2: Noche de película

## Estado

Planificación pendiente de implementación.
Todos los tickets deben seguir las especificaciones
aprobadas antes de modificar código.

## Definition of Done general

Un ticket se considera terminado cuando:

- Cumple sus criterios de aceptación.
- Respeta las reglas del PRD y la spec.
- No rompe las funcionalidades del Proyecto 3.
- Tiene las pruebas correspondientes cuando aplica.
- No expone claves ni información privada.
- Se verifica su funcionamiento.
- Se registra el resultado de la verificación.
- Tiene un commit con el identificador del ticket.

## E2-01 — Reglas de tiempo y duración

Tipo: Dominio y pruebas.
Historia: E2-H01, E2-H02 y E2-H03.
Dependencias: Ninguna.

Trabajo:
- Crear funciones puras en src/dominio/.
- Validar tiempos entre 30 y 600 minutos.
- Calcular duraciones y pausas.
- Determinar si una película cabe.
- Rechazar duraciones desconocidas o inválidas.
- Incorporar pruebas con Vitest.

DoD:
- Las funciones no utilizan TMDB ni Supabase.
- Los casos límite tienen pruebas automatizadas.
- Se permite ocupar exactamente el tiempo disponible.
- Una sola película no genera pausas.
- Las pruebas del dominio pasan.

## E2-02 — Consulta de películas elegibles

Tipo: Servicios.
Historia: E2-H02.
Dependencias: E2-01.

Trabajo:
- Consultar películas de la colección del usuario.
- Seleccionar únicamente películas por_ver.
- Excluir series.
- Obtener duraciones desde TMDB.
- Gestionar cargas, errores y datos desconocidos.

DoD:
- Se utilizan servicios separados de los componentes.
- Se muestran los motivos de indisponibilidad.
- No se exponen claves privadas.
- Se verifican los casos de error.

## E2-03 — Modelo de datos y seguridad

Tipo: Base de datos y seguridad.
Historia: E2-H04.
Dependencias: Especificación aprobada.

Trabajo:
- Crear migración SQL de sesiones y películas.
- Asociar las sesiones al usuario autenticado.
- Definir las políticas RLS correspondientes.
- Preparar operaciones de consulta y guardado.
- Verificar el aislamiento de datos con dos cuentas.

DoD:
- Migración SQL documentada y aplicada.
- Políticas RLS habilitadas.
- Los usuarios solo acceden a sus propias sesiones.
- Se conserva el detalle de sesiones guardadas.
- Las pruebas de seguridad están documentadas.

## E2-04 — Interfaz Noche de película

Tipo: Interfaz.
Historia: E2-H01, E2-H02 y E2-H03.
Dependencias: E2-01 y E2-02.

Trabajo:
- Crear pantalla accesible con sesión iniciada.
- Introducir y validar el tiempo disponible.
- Mostrar películas elegibles y sus duraciones.
- Permitir agregar y quitar películas.
- Mostrar tiempo total, pausas y tiempo restante.
- Gestionar estados vacíos, carga y error.
- Mantener coherencia con DESIGN.md y Bootstrap.

DoD:
- La interfaz cumple los criterios de aceptación.
- Funciona en escritorio y móvil.
- No realiza consultas directas a TMDB ni Supabase.
- Las funciones del Proyecto 3 siguen funcionando.

## E2-05 — Guardar sesiones

Tipo: Integración.
Historia: E2-H04.
Dependencias: E2-01, E2-03 y E2-04.

Trabajo:
- Guardar sesiones válidas en Supabase.
- Asociar nombre, fecha y usuario.
- Guardar las películas y duraciones.
- Impedir sesiones vacías o que excedan el tiempo.
- Mantener sin cambios el estado de los títulos.

DoD:
- Se guardan únicamente sesiones válidas.
- Se muestra confirmación o error.
- No se cambia el estado de las películas.
- Los registros pertenecen al usuario autenticado.

## E2-06 — Consultar sesiones guardadas

Tipo: Interfaz e integración.
Historia: E2-H04.
Dependencias: E2-03 y E2-05.

Trabajo:
- Mostrar las sesiones guardadas del usuario.
- Consultar sus películas y duración total.
- Mostrar nombre y fecha de creación.
- Mantener las sesiones en modo solo lectura.
- Gestionar estados de carga, vacío y error.

DoD:
- El usuario consulta sus propias sesiones.
- Se visualiza el detalle de cada sesión.
- Una película eliminada de la colección
  no elimina su información histórica.
- No se muestran datos de otros usuarios.

## E2-07 — Verificación integral

Tipo: Calidad.
Historias: Todas.
Dependencias: E2-01 a E2-06.

Trabajo:
- Ejecutar pruebas Vitest.
- Ejecutar compilación y revisión ESLint.
- Verificar los criterios en el navegador.
- Probar autenticación y seguridad RLS.
- Completar docs/VERIFICACION.md.
- Registrar problemas pendientes.

DoD:
- Cada criterio tiene evidencia.
- Se documentan resultados reales.
- Los problemas heredados se distinguen
  de los introducidos por E2.
- No se afirma cumplimiento sin pruebas.

## Orden de implementación

E2-01 → E2-02 → E2-03 → E2-04 →
E2-05 → E2-06 → E2-07.

Este orden es orientativo y respeta las
dependencias de cada ticket.

## Reglas para los commits

- Implementar un ticket por vez.
- Incluir su identificador en el commit.
- Ejecutar las verificaciones aplicables.
- No mezclar cambios de tickets diferentes.
