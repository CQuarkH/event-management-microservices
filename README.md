# Desafío: Implementación de pruebas unitarias, integración y humo

Pruebas de Software

## Integrantes

- Cristóbal Pavez
- Benjamin San Martin
- Herbert Garrido
- Elías Currihuil

## Arquitectura

```
┌─────────────────────────────────────────┐
│         PostgreSQL Database             │
│              Puerto: 5432               │
└────────────────┬────────────────────────┘
                 │
       ┌─────────┴─────────┐
       │                   │
┌──────▼───────┐    ┌──────▼──────────┐
│  Database    │    │   Notifications │
│   Service    │◄───┤    Service      │
│  (Node.js)   │    │   (Python)      │
│  Puerto:3000 │    │   Puerto: 5003  │
└──────────────┘    └─────────────────┘
```

## Inicio Rápido con Docker

### Levantar TODO el sistema:

```bash
# Clonar repositorio
git clone <repo-url>
cd event-management-microservices

# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Verificar estado
docker-compose ps
```

### Servicios disponibles:

- **Database Service**: http://localhost:3000
  - Swagger: http://localhost:3000/api-docs
- **Notifications Service**: http://localhost:5003
  - Health: http://localhost:5003/api/notifications/health
- **PostgreSQL**: localhost:5432
  - User: postgres
  - Password: password
  - Database: database_service_db

## Desarrollo Local

### Notifications Service:

```bash
cd notifications-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Asegurar que database-service está corriendo
export DATABASE_SERVICE_URL=http://localhost:3000
python src/app.py
```

### Tests:

```bash
# Tests unitarios
cd notifications-service
pytest tests/test_notifications.py -v

# Tests de integración (requiere BD corriendo)
docker-compose up -d postgres database-service
pytest tests/test_integration.py -v
```

## Detener Servicios

```bash
# Detener
docker-compose down

# Detener y limpiar datos
docker-compose down -v
```
