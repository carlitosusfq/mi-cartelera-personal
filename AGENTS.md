
# AGENTS.md — Mi Cartelera Personal

## Contexto
Proyecto 3 existente: React, TypeScript, Vite, TMDB y Supabase.
Épica E2: Noche de película. E1 debe seguir funcionando.

## Regla principal
NINGUNA FUNCIONALIDAD SIN SPEC.

## Instrucciones
1. Leer README.md y docs/ESTADO-INICIAL.md antes de modificar código.
2. No reescribir el Proyecto 3 ni alterar funcionalidades existentes.
3. Seguir PRD, backlog, tickets y specs antes de implementar.
4. Trabajar un ticket por vez con criterios verificables.
5. Separar funciones puras del dominio de servicios y componentes.
6. Los componentes no consultan directamente TMDB ni Supabase.
7. Mantener autenticación y seguridad RLS por usuario.
8. Nunca exponer claves, tokens o archivos .env.local.
9. Usar TypeScript y Vitest para reglas del dominio.
10. Seguir DESIGN.md y conservar Bootstrap.
11. Aplicar Prettier y ejecutar build, lint y tests disponibles.
12. Documentar verificaciones, errores y limitaciones.
13. No afirmar resultados sin evidencia.
14. No modificar archivos fuera del ticket sin justificación.

## Orden obligatorio
Harness → Estado inicial → PRD → Backlog → Specs →
Implementación → Verificación → Auditoría.

## Comandos
- npm.cmd run dev
- npm.cmd run build
- npm.cmd run lint
