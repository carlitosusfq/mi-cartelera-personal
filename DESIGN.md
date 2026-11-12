
# DESIGN.md — Sistema de diseño

## 1. Identidad visual

Mi Cartelera Personal utiliza una identidad visual
cinematográfica, moderna y minimalista.

La aplicación emplea una interfaz oscura con acentos
rojos y tarjetas que destacan los pósteres de películas.

La épica E2, Noche de película, debe conservar esta
identidad visual y ser coherente con el Proyecto 3.

## 2. Paleta de colores

| Elemento | Color |
|---|---|
| Fondo principal | #141419 |
| Superficie de tarjetas | #202027 |
| Rojo principal | #E50914 |
| Rojo hover | #B20710 |
| Bordes | #30303A |
| Bordes de formularios | #40404A |
| Texto principal | #FFFFFF |
| Texto secundario | #AAAAB5 |
| Error | #FF7777 |
| Éxito | #69D49A |
| Calificación | #F5C518 |


## 3. Tipografía

La aplicación utiliza la siguiente familia tipográfica:

Arial, Helvetica, sans-serif.

Esta configuración está definida en src/index.css.

Reglas:
- Mantener Arial como fuente principal.
- Utilizar texto blanco (#FFFFFF) sobre superficies oscuras.
- Títulos de sección: aproximadamente 26 px.
- Encabezado principal: tamaño responsive.
- Texto secundario: #AAAAB5.
- Mantener una jerarquía visual clara.
- Evitar fuentes decorativas que dificulten la lectura.


## 4. Espaciado

- Contenedor principal: máximo 1200 px.
- Separación habitual entre tarjetas: 24 px.
- Padding de tarjetas: entre 16 y 24 px.
- Separación entre secciones: aproximadamente 40–70 px.
- Mantener espaciados consistentes en nuevas pantallas.

## 5. Componentes

### Botones

- Acción principal: fondo #E50914.
- Texto blanco y peso negrita.
- Bordes redondeados de 8 px.
- Hover: fondo #B20710.
- Estado deshabilitado visible.
- No utilizar el color rojo para todas las acciones.

### Tarjetas

- Fondo #202027.
- Borde de 1 px en #30303A.
- Radio de borde de 12–14 px.
- Efecto hover discreto cuando corresponda.
- Mantener los pósteres con proporción 2:3.

### Formularios

- Fondo oscuro.
- Texto blanco.
- Borde #40404A.
- Foco visible con el color principal.
- Etiquetas asociadas a sus campos.
- Mensajes de error claros.

### Mensajes de estado

- Éxito: #69D49A.
- Error: #FF7777.
- Información secundaria: #AAAAB5.
- Mostrar estados de carga de forma comprensible.

## 6. Bootstrap

El Proyecto 3 utiliza CSS personalizado.

En la revisión inicial:
- Bootstrap no aparece como dependencia de npm.
- index.html no incluye Bootstrap por CDN.

Para cumplir la consigna, la nueva épica deberá
utilizar Bootstrap de manera controlada y conservar
la identidad visual existente.

Componentes y utilidades previstos:
- Container y sistema de grid.
- Cards.
- Formularios.
- Botones.
- Utilidades responsive y de espaciado.

La incorporación de Bootstrap debe planificarse
en la spec antes de modificar el código existente.

Los estilos propios del proyecto tendrán prioridad
cuando sean necesarios para conservar la identidad.

## 7. Reglas de la interfaz

### DEBE

- Mantener coherencia con el Proyecto 3.
- Mostrar tiempo disponible y restante.
- Mostrar duración de cada película.
- Diferenciar estados de carga, error y vacío.
- Indicar por qué una película no está disponible.
- Utilizar etiquetas y controles accesibles.
- Adaptarse a escritorio y móvil.
- Mostrar confirmación después de guardar una sesión.
- Mantener el contraste y los estados de foco visibles.

### NO DEBE

- Cambiar el diseño existente sin justificación.
- Utilizar estilos inconsistentes.
- Depender únicamente del color para indicar errores.
- Ocultar información importante en pantallas pequeñas.
- Incorporar librerías visuales sin documentarlas.
- Mostrar una película sin duración como disponible.
- Utilizar mensajes técnicos incomprensibles.

## 8. Pantalla Noche de película

La interfaz de E2 deberá incorporar:

1. Título y descripción de la funcionalidad.
2. Campo para indicar tiempo disponible.
3. Lista de películas por ver.
4. Duración individual de las películas.
5. Selección y eliminación de películas de la sesión.
6. Cálculo de pausas de 10 minutos entre películas.
7. Visualización del tiempo total y restante.
8. Mensajes cuando una película no cabe.
9. Acción para guardar la sesión.
10. Consulta de sesiones guardadas.

La pantalla seguirá las reglas de DESIGN.md.

## 9. Referencia visual

El brand board se encuentra en:

docs/diseno/brand-board.html

La especificación de interfaz de E2 deberá citar
DESIGN.md por nombre y respetar sus reglas.
