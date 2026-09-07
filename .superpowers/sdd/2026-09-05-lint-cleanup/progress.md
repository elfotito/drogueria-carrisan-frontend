# SDD ledger — plan: docs/superpowers/plans/2026-09-05-lint-cleanup.md

## Setup
- Workspace: `.superpowers/sdd/2026-09-05-lint-cleanup/`
- BASE commit before implementation: `08d3188` (main, working tree with eslint.config.js edited)
- Lint baseline: 151 problems (138 errors, 13 warnings) en 79 archivos
- After Task 1: 142 problems (129 errors, 13 warnings) — los 9 `react-refresh/only-export-components` resueltos via config
- Repo: git main; no worktree (ver Rulings)

## Pre-flight scan (tareas 2-7)
- Files disjuntos entre tasks ✓ (verificado por grep en reporte baseline + lista de archivos de cada task; sin solape)
- Interfaz compartida: `useEnvio`/`opcionesEnvio` es tocada en Task 2 (Navbar destructuring) y Task 4 (EnvioContext useMemo) — archivos distintos, sin conflicto de escritura ✓
- Task 8 no toca archivos ✓
- Task 1 (config) ya ejecutada antes de este ledger; no necesita re-dispatch

## Task 1: Config allowExportNames
- Task 1: complete (eslint.config.js edits aplicados, lint 151→142; build diferido a Task 8, estilo git del repo respetado)

## Rulings
- Ruling: no se usa git worktree ni branch nueva; se trabaja en main — el humano dirigio explicitamente este trabajo en el repo/branch actual, es cambio mecaniciano de 1 commit al final. Costo si me equivoco: bajo (un solo commit final, sin commits intermedios).
- Ruling: la revision por tarea sera el gate automatizado (per-task `npx eslint <archivos>` → 0 + build final) mas lectura del diff por el controller, no un subagente reviewer por cada tarea — el diseno aprobado por el usuario especifico subagentes por grupo con verificacion eslint y commit unico final; 6 reviewers adicionales no agregan informacion sobre un gate automatizado + revision del diff. Costo si me equivoco: una regresion de comportamiento sutil podria pasar el gate; mitigado por revision del diff completo antes del commit.
- Ruling: breve de cada tarea extraido a `task-N-brief.md` (lines 13-175 compartidas + seccion de la tarea); los subagentes leen el brief, no el plan completo.