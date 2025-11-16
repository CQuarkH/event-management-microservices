import { Router } from "express";
import defaultController from "../controllers/attendees.controller.js";

const router = Router();

/**
 * @openapi
 * /attendees:
 *   post:
 *     summary: Create a new attendee
 *     tags:
 *       - Attendees
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AttendeeCreate'
 *     responses:
 *       '201':
 *         description: Attendee created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Attendee'
 */
router.post("/", defaultController.createAttendee);

/**
 * @openapi
 * /attendees:
 *   get:
 *     summary: List attendees
 *     tags:
 *       - Attendees
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: Page size
 *     responses:
 *       '200':
 *         description: List of attendees
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Attendee'
 */
router.get("/", defaultController.listAttendees);

/**
 * @openapi
 * /attendees/{id}:
 *   get:
 *     summary: Get attendee by ID
 *     tags:
 *       - Attendees
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Attendee object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Attendee'
 *       '404':
 *         description: Not found
 */
router.get("/:id", defaultController.getAttendee);

/**
 * @openapi
 * /attendees/{id}/status:
 *   patch:
 *     summary: Update attendee status
 *     tags:
 *       - Attendees
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [confirmed, unconfirmed]
 *     responses:
 *       '200':
 *         description: Updated attendee
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Attendee'
 */
router.patch("/:id/status", defaultController.patchStatus);

export default router;
