import { Router } from "express";
import * as ctrl from "../controllers/notifications.controller.js";

const router = Router();

/**
 * @openapi
 * /notifications:
 *   post:
 *     summary: Send a notification (registers it in DB)
 *     tags:
 *       - Notifications
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotificationCreate'
 *     responses:
 *       '201':
 *         description: Notification created and sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 */
router.post("/notifications", ctrl.sendNotification);

/**
 * @openapi
 * /notifications:
 *   get:
 *     summary: List notifications
 *     tags:
 *       - Notifications
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
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 */
router.get("/notifications", ctrl.listNotifications);

/**
 * @openapi
 * /notifications/{id}:
 *   get:
 *     summary: Get notification by id
 *     tags:
 *       - Notifications
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Notification object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 */
router.get("/notifications/:id", ctrl.getNotification);

/**
 * @openapi
 * /notifications/{id}:
 *   put:
 *     summary: Update a notification
 *     tags:
 *       - Notifications
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
 *             $ref: '#/components/schemas/NotificationUpdate'
 *     responses:
 *       '200':
 *         description: Updated notification
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 */
router.put("/notifications/:id", ctrl.updateNotification);

/**
 * @openapi
 * /notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags:
 *       - Notifications
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
router.delete("/notifications/:id", ctrl.deleteNotification);

export default router;
