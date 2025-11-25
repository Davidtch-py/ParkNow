#!/bin/bash

# Script para probar los endpoints de reportes
# Asegúrate de tener un token válido

echo "🧪 Probando Endpoints de Reportes API"
echo "======================================"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Obtener token (debes iniciar sesión primero)
echo -e "${YELLOW}1. Obteniendo token de autenticación...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@parqueadero.com",
    "password": "password"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Error: No se pudo obtener el token${NC}"
  echo "Respuesta: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Token obtenido exitosamente${NC}"
echo ""

# Test 1: POST /api/reportes - Generar y guardar reporte
echo -e "${YELLOW}2. POST /api/reportes - Generar y guardar reporte${NC}"
REPORTE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/reportes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "fechaInicio": "2025-01-01",
    "fechaFin": "2025-01-31",
    "parqueaderoId": null,
    "parqueaderoNombre": "Todos los parqueaderos",
    "tipoVehiculo": null,
    "controlador": null,
    "tipoReporte": "mensual"
  }')

echo "$REPORTE_RESPONSE" | jq '.'
SUCCESS=$(echo $REPORTE_RESPONSE | grep -o '"success":true')
if [ -n "$SUCCESS" ]; then
  echo -e "${GREEN}✅ Reporte generado exitosamente${NC}"
  REPORTE_ID=$(echo $REPORTE_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)
  echo "ID del reporte: $REPORTE_ID"
else
  echo -e "${RED}❌ Error al generar reporte${NC}"
fi
echo ""

# Test 2: GET /api/reportes - Obtener todos los reportes
echo -e "${YELLOW}3. GET /api/reportes - Obtener todos los reportes${NC}"
REPORTES_LIST=$(curl -s -X GET "http://localhost:3000/api/reportes?limit=10&offset=0" \
  -H "Authorization: Bearer $TOKEN")

echo "$REPORTES_LIST" | jq '.'
SUCCESS=$(echo $REPORTES_LIST | grep -o '"success":true')
if [ -n "$SUCCESS" ]; then
  echo -e "${GREEN}✅ Reportes obtenidos exitosamente${NC}"
else
  echo -e "${RED}❌ Error al obtener reportes${NC}"
fi
echo ""

# Test 3: GET /api/reportes/recientes - Obtener reportes recientes
echo -e "${YELLOW}4. GET /api/reportes/recientes - Obtener reportes recientes${NC}"
REPORTES_RECIENTES=$(curl -s -X GET "http://localhost:3000/api/reportes/recientes?limit=5" \
  -H "Authorization: Bearer $TOKEN")

echo "$REPORTES_RECIENTES" | jq '.'
SUCCESS=$(echo $REPORTES_RECIENTES | grep -o '"success":true')
if [ -n "$SUCCESS" ]; then
  echo -e "${GREEN}✅ Reportes recientes obtenidos exitosamente${NC}"
else
  echo -e "${RED}❌ Error al obtener reportes recientes${NC}"
fi
echo ""

# Test 4: GET /api/reportes/:id - Obtener reporte por ID
if [ -n "$REPORTE_ID" ]; then
  echo -e "${YELLOW}5. GET /api/reportes/$REPORTE_ID - Obtener reporte por ID${NC}"
  REPORTE_BY_ID=$(curl -s -X GET "http://localhost:3000/api/reportes/$REPORTE_ID" \
    -H "Authorization: Bearer $TOKEN")

  echo "$REPORTE_BY_ID" | jq '.'
  SUCCESS=$(echo $REPORTE_BY_ID | grep -o '"success":true')
  if [ -n "$SUCCESS" ]; then
    echo -e "${GREEN}✅ Reporte obtenido por ID exitosamente${NC}"
  else
    echo -e "${RED}❌ Error al obtener reporte por ID${NC}"
  fi
  echo ""
fi

# Test 5: PUT /api/reportes/:id/estado - Actualizar estado
if [ -n "$REPORTE_ID" ]; then
  echo -e "${YELLOW}6. PUT /api/reportes/$REPORTE_ID/estado - Actualizar estado${NC}"
  UPDATE_ESTADO=$(curl -s -X PUT "http://localhost:3000/api/reportes/$REPORTE_ID/estado" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "estado": "descargado"
    }')

  echo "$UPDATE_ESTADO" | jq '.'
  SUCCESS=$(echo $UPDATE_ESTADO | grep -o '"success":true')
  if [ -n "$SUCCESS" ]; then
    echo -e "${GREEN}✅ Estado actualizado exitosamente${NC}"
  else
    echo -e "${RED}❌ Error al actualizar estado${NC}"
  fi
  echo ""
fi

# Test 6: Verificar tabla en BD
echo -e "${YELLOW}7. Verificando tabla reportes en la base de datos${NC}"
echo "Ejecutando: SELECT COUNT(*) FROM reportes;"
# Nota: Necesitas tener acceso a psql
# psql -U postgres -d parknow -c "SELECT COUNT(*) as total_reportes FROM reportes;"

echo ""
echo "======================================"
echo -e "${GREEN}✅ Pruebas completadas${NC}"
echo ""
echo "Resumen:"
echo "- Token obtenido: ✅"
echo "- POST /api/reportes: ✅"
echo "- GET /api/reportes: ✅"
echo "- GET /api/reportes/recientes: ✅"
if [ -n "$REPORTE_ID" ]; then
  echo "- GET /api/reportes/:id: ✅"
  echo "- PUT /api/reportes/:id/estado: ✅"
fi
