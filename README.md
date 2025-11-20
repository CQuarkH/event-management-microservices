# Desafío: Implementación de pruebas unitarias, integración y humo

Pruebas de Software

## Integrantes

- Cristóbal Pavez
- Benjamin San Martin
- Herbert Garrido
- Elías Currihuil

# Ejecución de las Pruebas

## Pruebas Unitarias y de Integración por Microservicio

### Microservicio de Base de Datos

**Instalar Dependencias**

```
cd database-service && npm install
```

**Ejecutar Pruebas Unitarias**

```
npm run test:unit
```

**Ejecutar Pruebas de Integración**

```
npm run test:integration
```

---

### Microservicio de Gestión de Asistentes

**Instalar Dependencias**

```
cd attendees-service && npm install
```

**Ejecutar Pruebas Unitarias**

```
npm test -- --coverage
```

**Ejecutar Pruebas de Integración**

```
docker-compose up -d database-service notifications-service

npx jest tests/smoke/smoke.spec.ts
```

---

### Microservicio de Gestión de Entradas

**Instalar Dependencias**

```
cd tickets-service && python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**Ejecutar Pruebas Unitarias y de Integración**

```
python -m pytest tests/unit/ tests/integration/ --cov=src -v
```

---

### Microservicio de Notificaciones

**Instalar Dependencias**

```
cd notifications-service && python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**Ejecutar Pruebas Unitarias**

```
pytest tests/test_notifications.py --cov=src -v
```

**Ejecutar Pruebas de Integración**

```
docker-compose up -d postgres database-service
pytest tests/test_integration.py -v
```

---

## Pruebas de Humo Generales

### Ejecución

Para ejecutar las pruebas, es necesario ir a la raíz del repositorio y ejecutar:

```
docker-compose up --build
```

Esto levantará todos los microservicios y un contenedor adicional llamado `smoke-tests`, encargado de realizar las pruebas de humo entre microservicios. Éste último ejecutará las pruebas que están dentro de `tests/smoke`. Los resultados aparecerán una vez que finalice la ejecución del servicio `smoke-tests`, generando un reporte en el directorio `tests/test-reports/smoke_report.html`

---

### Escenarios Validados:

Se ha implementado una suite de pruebas automatizada (`tests/smoke/smoke_tests.py`) que corre en un contenedor independiente. Estas pruebas validan la **orquestación y comunicación exitosa** entre los 4 microservicios.

1.  **Flujo de Registro de Asistente (End-to-End):**
    - Valida la cadena: _Base de Datos (Crear Evento) → Asistentes (Registrar) → Notificaciones (Enviar correo de bienvenida)_.
2.  **Flujo de Compra de Entradas:**
    - Valida la interacción compleja: _Base de Datos → Tickets (Crear/Verificar Stock) → Asistentes → Tickets (Compra/Reducción de Stock) → Notificaciones_.
3.  **Flujo de Cancelación:**
    - Verifica la lógica de confirmar y luego cancelar asistencia, asegurando la notificación correspondiente.
4.  **Verificación de Salud (Health Checks):**
    - Confirma que los 4 microservicios estén levantados y respondiendo en sus puertos correspondientes antes de iniciar los flujos.
