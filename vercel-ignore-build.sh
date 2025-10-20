#!/bin/bash

# Script para ignorar builds de Vercel cuando solo cambian archivos del backend
# Este script retorna 0 (ignorar build) o 1 (hacer build)

echo "🔍 Verificando si hay cambios en el frontend..."

# Si es el primer commit, hacer build
if git rev-parse HEAD^ >/dev/null 2>&1; then
  # Verificar si hay cambios en frontend/ o vercel.json
  if git diff --quiet HEAD^ HEAD -- frontend/ vercel.json; then
    echo "❌ No hay cambios en frontend, ignorando build"
    exit 0
  else
    echo "✅ Hay cambios en frontend, procediendo con build"
    exit 1
  fi
else
  echo "✅ Primer commit, procediendo con build"
  exit 1
fi
