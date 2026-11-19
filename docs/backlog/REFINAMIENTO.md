
# Refinamiento — Épica E2: Noche de película

## Estado

Propuesta de refinamiento asistida por ChatGPT.
Pendiente de revisión y aceptación por el estudiante.

## Casos borde propuestos

### CB-01 — Tiempo exactamente igual al límite
Propuesta: permitir una sesión que utilice exactamente
todos los minutos disponibles.

Decisión: ACEPTADO.
Razón: coincide con la regla del cliente sobre el límite exacto.

### CB-02 — Una sola película
Propuesta: no agregar pausas cuando hay una sola película.

Decisión: ACEPTADO.
Razón: las pausas existen únicamente entre películas.

### CB-03 — Película sin duración
Propuesta: mostrarla como no disponible y explicar el motivo.

Decisión: ACEPTADO.
Razón: coincide con las reglas del cliente.

### CB-04 — Tiempo fuera de rango
Propuesta: rechazar valores menores a 30, mayores a 600,
decimales, vacíos o no numéricos.

Decisión: ACEPTADO.
Razón: el tiempo debe ser un entero entre 30 y 600.

### CB-05 — Película repetida dentro de una sesión
Propuesta: impedir seleccionar dos veces la misma película
en una misma sesión.

Decisión propuesta: ACEPTADO.
Razón: evita duplicados accidentales.

### CB-06 — Fallo de conexión con TMDB
Propuesta: mostrar un mensaje de error y permitir reintentar
la consulta sin perder las películas ya seleccionadas.

Decisión propuesta: ACEPTADO.
Razón: mejora la experiencia ante errores de red.

### CB-07 — Sesión sin películas
Propuesta: impedir guardar una sesión vacía.

Decisión propuesta: ACEPTADO.
Razón: una sesión debe contener al menos una película.

### CB-08 — Cambios en el tiempo disponible
Propuesta: si el usuario reduce el tiempo por debajo
del total seleccionado, avisar que la sesión ya no cabe
e impedir guardarla hasta corregirla.

Decisión propuesta: ACEPTADO.
Razón: evita guardar sesiones que incumplen el límite.

### CB-09 — Sesión compartida públicamente
Propuesta: permitir compartir sesiones mediante un enlace.

Decisión: RECHAZADO.
Razón: compartir sesiones está fuera del alcance definido.

### CB-10 — Recomendaciones externas
Propuesta: recomendar películas que no estén en la colección.

Decisión: RECHAZADO.
Razón: la sesión solo utiliza películas del usuario.

## Pendientes

- Revisar y confirmar las decisiones propuestas.
- Reflejar los casos aceptados en criterios de aceptación.
- Verificar que las historias cumplan INVEST.
- Crear los tickets y sus dependencias.
- Incorporar las reglas en la spec antes de programar.
