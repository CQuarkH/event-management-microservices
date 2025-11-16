// src/routes/tickets.routes.ts
import { Router } from "express";
import {
  createTicket,
  listTickets,
  getTicket,
  updateTicket,
  deleteTicket,
  availability,
  purchaseTicket,
} from "../controllers/tickets.controller.js";

const router = Router();

/**
 * @openapi
 * /tickets:
 *   post:
 *     summary: Create a ticket type for an event
 *     tags:
 *       - Tickets
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TicketCreate'
 *     responses:
 *       '201':
 *         description: Ticket created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 */
router.post("/", createTicket);

/**
 * @openapi
 * /tickets:
 *   get:
 *     summary: List tickets
 *     tags:
 *       - Tickets
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
 *         description: List of tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ticket'
 */
router.get("/", listTickets);

/**
 * @openapi
 * /tickets/availability:
 *   get:
 *     summary: Check ticket availability for an event
 *     tags:
 *       - Tickets
 *     parameters:
 *       - in: query
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Availability result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 available:
 *                   type: boolean
 *                 quantityAvailable:
 *                   type: integer
 */
router.get("/availability", availability);

/**
 * @openapi
 * /tickets/purchase:
 *   post:
 *     summary: Purchase tickets
 *     tags:
 *       - Tickets
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ticketId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       '201':
 *         description: Purchase successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 */
router.post("/purchase", purchaseTicket);

/**
 * @openapi
 * /tickets/{id}:
 *   get:
 *     summary: Get ticket by id
 *     tags:
 *       - Tickets
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Ticket object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 */
router.get("/:id", getTicket);

/**
 * @openapi
 * /tickets/{id}:
 *   put:
 *     summary: Update a ticket
 *     tags:
 *       - Tickets
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
 *             $ref: '#/components/schemas/TicketUpdate'
 *     responses:
 *       '200':
 *         description: Updated ticket
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 */
router.put("/:id", updateTicket);

/**
 * @openapi
 * /tickets/{id}:
 *   delete:
 *     summary: Delete a ticket
 *     tags:
 *       - Tickets
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
router.delete("/:id", deleteTicket);

export default router;
