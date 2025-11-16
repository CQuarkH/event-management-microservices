import { Router } from "express";
import * as ctrl from "../controllers/notifications.controller.js";

const router = Router();

router.post("/notifications", ctrl.sendNotification);
router.get("/notifications", ctrl.listNotifications);
router.get("/notifications/:id", ctrl.getNotification);
router.put("/notifications/:id", ctrl.updateNotification);
router.delete("/notifications/:id", ctrl.deleteNotification);

export default router;
