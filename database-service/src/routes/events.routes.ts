// src/routes/events.routes.ts
import { Router } from "express";
import {
  createEvent,
  listEvents,
  getEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/events.controller.js";

const router = Router();

/**
 * @openapi
 * /events:
 *   post:
 *     summary: Create event
 */
router.post("/", createEvent);
router.get("/", listEvents);
router.get("/:id", getEvent);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

export default router;
