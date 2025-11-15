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
router.post("/", createTicket);
router.get("/", listTickets);
router.get("/availability", availability);
router.post("/purchase", purchaseTicket);
router.get("/:id", getTicket);
router.put("/:id", updateTicket);
router.delete("/:id", deleteTicket);

export default router;
