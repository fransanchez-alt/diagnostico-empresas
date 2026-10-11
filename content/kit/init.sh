#!/usr/bin/env bash
# Comprueba que el entorno está listo antes de empezar.
set -e
echo "Proyecto: {{PROBLEMA}}"
command -v python3 >/dev/null && python3 --version || echo "Falta Python 3"
test -f docs/requisitos.md && echo "Requisitos: OK" || echo "Faltan los requisitos"
test -f progress/actual.md && echo "Memoria: OK" || echo "Falta la memoria"
