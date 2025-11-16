# Desafío: Implementación de pruebas unitarias, integración y humo

Pruebas de Software

## Integrantes

- Cristóbal Pavez
- Benjamin San Martin
- Herbert Garrido
- Elías Currihuil

# Módulo de Notificaciones

**Responsable**: Elías  
**Tecnología**: Python + Flask  
**Puerto**: 5003

## Descripción

Servicio encargado del envío y registro de notificaciones a asistentes del evento.

## Endpoints

### 1. Enviar Notificación

```http
POST /api/notifications/send
Content-Type: application/json

{
  "type": "email",  // "email" | "sms"
  "message": "Bienvenido al evento",
  "recipients": ["attendee_id_1", "attendee_id_2"]
}

Response 201:
{
  "status": "sent",
  "notification_id": "uuid",
  "sent_count": 2
}
```

### 2. Obtener Historial

```http
GET /api/notifications/history

Response 200:
{
  "notifications": [
    {
      "id": "uuid",
      "type": "email",
      "message": "...",
      "date_sent": "2024-11-15T10:30:00",
      "recipients": ["id1", "id2"]
    }
  ]
}
```

### 3. Obtener Notificación por ID

```http
GET /api/notifications/{id}

Response 200:
{
  "id": "uuid",
  "type": "sms",
  "message": "...",
  "date_sent": "2024-11-15T10:30:00",
  "recipients": ["id1"]
}
```

### 4. Health Check

```http
GET /api/notifications/health

Response 200:
{
  "status": "healthy",
  "service": "notifications",
  "database_connection": "ok"
}
```

## Instalación

```bash
cd notifications-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

## Ejecución

```bash
python app.py
# Servicio corriendo en http://localhost:5003
```

## Pruebas

```bash
# Pruebas unitarias
pytest tests/test_notifications.py -v

# Con cobertura
pytest tests/ --cov=app --cov-report=html

# Pruebas de integración (requiere BD corriendo)
pytest tests/test_integration.py -v
```

## Dependencias del Servicio

- **Módulo Base de Datos** (puerto 5000)
  - GET /api/notifications - Obtener historial
  - POST /api/notifications - Guardar notificación
  - GET /api/notifications/{id} - Obtener por ID
  - GET /api/attendees/{id} - Obtener datos del asistente

## Cobertura de Tests

Objetivo: Mínimo 80% de cobertura

- Pruebas unitarias: Lógica de envío y validación
- Pruebas de integración: Comunicación con BD
- Pruebas de humo: Flujos completos con otros servicios
