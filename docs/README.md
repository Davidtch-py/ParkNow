# 📚 Documentación de ParkNow

Documentación técnica y guías de implementación del sistema ParkNow.

## 📂 Estructura

### 🚀 Deployment (Despliegue)
Guías para desplegar la aplicación en producción y staging.

- **[RENDER_SETUP_GRATIS.md](deployment/RENDER_SETUP_GRATIS.md)** - Configuración de Render.com (100% gratis, sin tarjeta)
- **[CI_CD_SETUP.md](deployment/CI_CD_SETUP.md)** - Configuración de CI/CD con GitHub Actions

### 💻 Development (Desarrollo)
Documentación técnica para desarrolladores.

- **[MQTT_NOTIFICACIONES_GLOBALES.md](development/MQTT_NOTIFICACIONES_GLOBALES.md)** - Sistema de notificaciones en tiempo real
- **[FESTIVOS_API.md](development/FESTIVOS_API.md)** - Integración con API de festivos de Colombia

### 📋 Historias de Usuario
- **[historias_usuario.md](historias_usuario.md)** - Requisitos funcionales y casos de uso

## 🎯 Guías Rápidas

### Para Desarrolladores
1. Leer `../README.md` para setup inicial
2. Revisar `development/MQTT_NOTIFICACIONES_GLOBALES.md` para entender notificaciones
3. Ver `development/FESTIVOS_API.md` para gestión de festivos

### Para DevOps/Deployment
1. Seguir `deployment/RENDER_SETUP_GRATIS.md` para configurar servicios
2. Configurar `deployment/CI_CD_SETUP.md` para automatización
3. Verificar variables de entorno en cada servicio

## 🔗 Enlaces Útiles

- [Repositorio Principal](../)
- [Frontend README](../frontend/README.md)
- [Backend README](../backend/README.md)
- [Database Schema](../database/init.sql)

## 📝 Convenciones

### Commits
```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: formato, sin cambios de código
refactor: refactorización de código
test: agregar o corregir tests
chore: tareas de mantenimiento
```

### Ramas
```
main        → Producción
develop     → Staging
feature/*   → Nuevas funcionalidades
bugfix/*    → Correcciones
hotfix/*    → Correcciones urgentes en producción
```

## 🆘 Soporte

Si encuentras problemas:
1. Revisa la sección Troubleshooting en `../README.md`
2. Busca en Issues del repositorio
3. Crea un nuevo Issue con detalles

---

**Última actualización**: Octubre 2025
