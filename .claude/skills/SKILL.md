
---
name: commit
description: Revisa los cambios y prepara un commit seguro del proyecto.
disable-model-invocation: true
---

# Skill /commit — Mi Cartelera Personal

Esta skill se utiliza únicamente cuando el usuario invoca /commit.

## Procedimiento

1. Ejecutar git status para identificar cambios pendientes.
2. Revisar git diff y los archivos nuevos.
3. Verificar que no se incluyan secretos, tokens ni archivos .env.
4. Confirmar que los cambios corresponden al checkpoint o ticket.
5. Ejecutar las verificaciones aplicables:
   - npm.cmd run build
   - npm.cmd run lint
   - Tests disponibles, cuando existan.
6. Informar si alguna verificación falla.
7. Preparar un mensaje de commit descriptivo.
8. Solicitar autorización antes de crear el commit.
9. Agregar únicamente los archivos relacionados.
10. Crear el commit aprobado y mostrar su identificador.

## Convención de mensajes

- chore(harness): configuración inicial del agente
- docs(estado): documentación del proyecto existente
- docs(prd): especificación de la épica E2
- feat(E2-01): implementación del ticket E2-01
- test(E2-01): pruebas del ticket E2-01

## Restricciones

- Nunca incluir .env.local, contraseñas o claves API.
- Nunca ejecutar git push sin autorización explícita.
- No afirmar que una prueba pasó sin ejecutarla.
- No realizar commits de cambios ajenos al trabajo solicitado.
