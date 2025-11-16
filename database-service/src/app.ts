// src/app.ts
import "reflect-metadata";
import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger/swagger.js";
import eventsRouter from "./routes/events.routes.js";
import attendeesRouter from "./routes/attendees.routes.js";
import ticketsRouter from "./routes/tickets.routes.js";
import notifRoutes from "./routes/notifications.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(json());

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true })
);

app.get("/api-docs-json", (_req, res) => {
  res.json(swaggerSpec);
});


// mount events routes
app.use("/events", eventsRouter);
app.use("/attendees", attendeesRouter);
app.use("/tickets", ticketsRouter);
app.use(notifRoutes);


app.use(errorHandler);

export default app;
