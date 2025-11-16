import swaggerJSDoc from "swagger-jsdoc";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isProduction = process.env.NODE_ENV === "production";

// Patrones corregidos
const apiFiles = isProduction
  ? [
      join(__dirname, "./routes/*.js"), // En producción, busca en dist/routes
      join(__dirname, "../routes/*.js"), // Alternativa
    ]
  : [
      join(__dirname, "./routes/*.ts"), // En desarrollo, busca en src/routes
      join(__dirname, "../routes/*.ts"), // Alternativa
    ];

// Agrega logs para diagnóstico
console.log("Swagger looking for files in:", apiFiles);
console.log("NODE_ENV:", process.env.NODE_ENV);

// Configuración completa de Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Database Module API",
      version: "1.0.0",
      description:
        "API REST del módulo de base de datos (Eventos, Asistentes, Entradas, Notificaciones)",
    },
    components: {
      schemas: {
        AttendeeCreate: {
          type: "object",
          properties: {
            name: { type: "string" },
            email: { type: "string" },
            phone: { type: "string", nullable: true },
            status: {
              type: "string",
              enum: ["confirmed", "unconfirmed"],
              nullable: true,
            },
            eventId: { type: "string", nullable: true },
          },
          required: ["name", "email"],
        },
        Attendee: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
            phone: { type: "string", nullable: true },
            status: { type: "string", enum: ["confirmed", "unconfirmed"] },
            eventId: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        EventCreate: {
          type: "object",
          properties: {
            name: { type: "string" },
            date: { type: "string", format: "date-time" },
            location: { type: "string" },
            type: { type: "string" },
            description: { type: "string", nullable: true },
          },
          required: ["name", "date", "location", "type"],
        },
        Event: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            date: { type: "string", format: "date-time" },
            location: { type: "string" },
            type: { type: "string" },
            description: { type: "string", nullable: true },
          },
        },
        EventUpdate: {
          type: "object",
          properties: {
            name: { type: "string" },
            location: { type: "string" },
            description: { type: "string" },
          },
        },
        TicketCreate: {
          type: "object",
          properties: {
            eventId: { type: "string" },
            type: { type: "string" },
            price: { type: "number" },
            quantityAvailable: { type: "integer" },
          },
          required: ["eventId", "type", "price", "quantityAvailable"],
        },
        Ticket: {
          type: "object",
          properties: {
            id: { type: "string" },
            eventId: { type: "string" },
            type: { type: "string" },
            price: { type: "number" },
            quantityAvailable: { type: "integer" },
            quantitySold: { type: "integer" },
          },
        },
        TicketUpdate: {
          type: "object",
          properties: {
            price: { type: "number" },
            quantityAvailable: { type: "integer" },
          },
        },
        NotificationCreate: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["email", "sms"] },
            message: { type: "string" },
            recipients: { type: "array", items: { type: "string" } },
          },
          required: ["type", "message", "recipients"],
        },
        Notification: {
          type: "object",
          properties: {
            id: { type: "string" },
            type: { type: "string" },
            message: { type: "string" },
            sentAt: { type: "string", format: "date-time" },
            recipients: { type: "array", items: { type: "string" } },
          },
        },
        NotificationUpdate: {
          type: "object",
          properties: { message: { type: "string" } },
        },
      },
    },
  },
  apis: apiFiles, // donde buscar comentarios @openapi
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Log para verificar si se encontraron paths
console.log("Swagger paths found:", Object.keys(swaggerSpec.paths || {}));

export default swaggerSpec;
