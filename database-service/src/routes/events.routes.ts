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
 *     summary: Create an event
 *     tags:
 *       - Events
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventCreate'
 *     responses:
 *       '201':
 *         description: Event created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 */
router.post("/", createEvent);

/**
 * @openapi
 * /events:
 *   get:
 *     summary: List events
 *     tags:
 *       - Events
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: List of events
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 */
router.get("/", listEvents);

/**
 * @openapi
 * /events/{id}:
 *   get:
 *     summary: Get event by id
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Event object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 */
router.get("/:id", getEvent);

/**
 * @openapi
 * /events/{id}:
 *   put:
 *     summary: Update event
 *     tags:
 *       - Events
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
 *             $ref: '#/components/schemas/EventUpdate'
 *     responses:
 *       '200':
 *         description: Updated event
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 */
router.put("/:id", updateEvent);

/**
 * @openapi
 * /events/{id}:
 *   delete:
 *     summary: Delete an event
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: Deleted
 */
router.delete("/:id", deleteEvent);

export default router;
