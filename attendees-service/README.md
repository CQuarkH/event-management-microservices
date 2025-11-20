# Attendees Service — Módulo de gestión de asistentes

Microservicio responsable de gestionar asistentes: registro, confirmación, actualización y cancelación. Se integra con el Database Service para persistencia y con el Notifications Service para enviar notificaciones.

---

**Rápido (Quick Start)**

- **Clona y entra**:

```powershell
cd attendees-service
```

- **Instala dependencias**:

```powershell
npm install
```

- **Variables de entorno**: copia `.env.example` → `.env` y ajusta las URLs.

- **Modo desarrollo** (con recarga):

```powershell
npm run dev
```

- **Modo producción (build + run local)**:

```powershell
npm run build
node dist/app.js
```

El servicio escucha por defecto en `http://localhost:5001`.

---

**Variables de entorno principales**

- `PORT` — puerto del servicio (default 5001)
- `DATABASE_SERVICE_URL` — URL del Database Service (ej. `http://localhost:3000`)
- `NOTIFICATIONS_SERVICE_URL` — URL del Notifications Service (ej. `http://localhost:5003`)

Añade otras variables según `src/config/env.ts` si es necesario.

---

**Scripts útiles**

- `npm run dev` : inicia en modo desarrollo (con watch)
- `npm run build`: compila TypeScript a `dist/`
- `npm start`     : ejecuta `node dist/app.js`
- `npm test`      : ejecuta unit tests

---

**Docker (rápido)**

- Para construir la imagen local:

```powershell
docker build -t attendees-service:local .
```

- Para ejecutar (mapea puerto):

```powershell
docker run --rm -p 5001:5001 --env-file .env attendees-service:local
```

> Nota: el `Dockerfile` incluye la expectativa de que el código compilado esté en `dist/`. Ejecuta `npm run build` antes de construir la imagen si trabajas localmente.

---

**API — Endpoints principales**

Prefijo base: `/api/attendees`

| Método | Endpoint | Descripción | Body |
|---|---:|---|---|
| POST | `/` | Registrar un nuevo asistente | `{ name, email, phone }` |
| GET | `/:id` | Obtener un asistente por id | — |
| PUT | `/:id` | Actualizar datos de un asistente | `{ name?, email?, phone? }` |
| PATCH | `/:id/confirm` | Confirmar asistencia | — |
| DELETE | `/:id` | Cancelar asistencia (soft) | — |

Ejemplo (registro):

```bash
curl -X POST http://localhost:5001/api/attendees \
	-H "Content-Type: application/json" \
	-d '{"name":"Ana","email":"ana@example.com","phone":"123"}'
```

---

**Pruebas**

- Unitarias (rápidas, con mocks):

```powershell
npm test
```

- Smoke / integración (requieren DB + Notifications arriba):

```powershell
# Desde la raíz del repo
docker-compose up -d database-service notifications-service

npx jest tests/smoke/smoke.spec.ts
```

---

**Dependencias externas**

- Database Service — persistencia (por defecto `http://localhost:3000`)
- Notifications Service — envío de correos (por defecto `http://localhost:5003`)

---