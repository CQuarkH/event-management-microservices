# Módulo de Gestión de Entradas (Tickets Service)

Microservicio para gestión de entradas de eventos: verificación de disponibilidad, compra/venta e integración con base de datos.

## Instalación y Configuración

```bash
# 1. Navegar al directorio
cd tickets-service

# 2. Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Linux/macOS
# venv\Scripts\activate   # Windows

# 3. Instalar dependencias
pip install -r requirements.txt

```

## Ejecución

```bash
# Ejecutar servicio
python -m src.app
# Disponible en http://localhost:5002

# Verificar funcionamiento
curl http://localhost:5002/api/tickets/health
```

## Pruebas

```bash
# Todas las pruebas con cobertura
python -m pytest tests/unit/ tests/integration/ --cov=src -v

# Solo pruebas unitarias
python -m pytest tests/unit/ -v

# Solo pruebas de integración  
python -m pytest tests/integration/ -v

# Pruebas de humo (requiere database-service ejecutándose)
python -m pytest tests/smoke/ -v
```

## API Endpoints

- `GET /api/tickets/health` - Health check
- `GET /api/tickets/` - Listar todas las entradas
- `GET /api/tickets/{ticket_id}` - Obtener entrada específica
- `GET /api/tickets/availability/{ticket_id}` - Verificar disponibilidad
- `POST /api/tickets/purchase` - Comprar entradas
- `PUT /api/tickets/{ticket_id}` - Actualizar entrada

## Dependencias

**Importante**: Requiere que el `database-service` esté ejecutándose en puerto 3000.

```bash
# Ejecutar database-service
cd ../database-service
npm install && npm start
```

## Cobertura de Pruebas

- **Cobertura total**: 86.36% (supera el 80% requerido)
- **Total pruebas**: 42 (100% pasando)
- **Componentes**: Models 100%, Services 100%, Controllers 67%
