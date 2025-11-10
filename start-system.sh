#!/bin/bash

# Colores para las salidas
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Iniciando el sistema ParkNow ===${NC}"

# Directorio actual
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Matar procesos previos si existen
echo -e "${BLUE}Deteniendo servicios previos si existen...${NC}"
pkill -f "node.*server.js" 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null

# Iniciar backend en segundo plano
echo -e "${BLUE}Iniciando el backend...${NC}"
cd "$DIR/backend"
npm start &
BACKEND_PID=$!
echo -e "${GREEN}Backend iniciado con PID: $BACKEND_PID${NC}"

# Esperar 5 segundos para que el backend se inicie completamente
echo "Esperando 5 segundos para que el backend se inicialice..."
sleep 5

# Iniciar frontend en segundo plano
echo -e "${BLUE}Iniciando el frontend...${NC}"
cd "$DIR/frontend"
npm start &
FRONTEND_PID=$!
echo -e "${GREEN}Frontend iniciado con PID: $FRONTEND_PID${NC}"

# Función para manejar la señal de interrupción
function cleanup() {
    echo -e "${RED}Deteniendo servicios...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}Servicios detenidos.${NC}"
    exit 0
}

# Registrar la función para la señal SIGINT (Ctrl+C)
trap cleanup SIGINT

echo -e "${GREEN}=== Sistema ParkNow iniciado ===${NC}"
echo -e "Backend: http://localhost:3000"
echo -e "Frontend: http://localhost:3001"
echo -e "Credenciales de administrador:"
echo -e "  Email: admin@parqueadero.com"
echo -e "  Contraseña: password"
echo -e "Credenciales de controlador:"
echo -e "  Email: juan.perez@parqueadero.com"
echo -e "  Contraseña: password"
echo -e "Presiona Ctrl+C para detener todos los servicios."

# Mantener el script en ejecución
wait
