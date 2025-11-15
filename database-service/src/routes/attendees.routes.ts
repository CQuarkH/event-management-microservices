// src/routes/attendees.routes.ts
import { Router } from "express";
import defaultController from "../controllers/attendees.controller.js";

const router = Router();

/**
 * POST /attendees
 * body: { name, email, phone?, status?, eventId? }
 */
router.post("/", defaultController.createAttendee);

/**
 * GET /attendees?eventId=...
 */
router.get("/", defaultController.listAttendees);

/**
 * GET /attendees/:id
 */
router.get("/:id", defaultController.getAttendee);

/**
 * PATCH /attendees/:id/status
 * body: { status: "confirmed" | "unconfirmed" }
 */
router.patch("/:id/status", defaultController.patchStatus);

export default router;
