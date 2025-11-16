// src/controllers/tickets.controller.ts
import type { Request, Response, NextFunction } from "express";
import { PrismaTicketsRepository } from "../repositories/prisma/prisma-tickets.repository.js";
import { TicketsService } from "../services/tickets.service.js";

/**
 * Factory that creates a tickets controller given a TicketsService.
 * This makes unit testing trivial because we can inject a mock service.
 */
export function createTicketsController(service: TicketsService) {
  return {
    createTicket: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const created = await service.createTicket(req.body);
        res.status(201).json(created);
      } catch (err) {
        next(err);
      }
    },

    listTickets: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const page = req.query.page ? Number(req.query.page) : 1;
        const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 100;
        const items = await service.listTickets({}, { page, pageSize });
        res.json(items);
      } catch (err) {
        next(err);
      }
    },

    getTicket: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const t = await service.getTicketById(req.params.id);
        res.json(t);
      } catch (err) {
        next(err);
      }
    },

    updateTicket: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const updated = await service.updateTicket(req.params.id, req.body);
        res.json(updated);
      } catch (err) {
        next(err);
      }
    },

    deleteTicket: async (req: Request, res: Response, next: NextFunction) => {
      try {
        await service.deleteTicket(req.params.id);
        res.status(204).send();
      } catch (err) {
        next(err);
      }
    },

    availability: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const ev = String(req.query.eventId || "");
        const type = String(req.query.type || "");
        const result = await service.checkAvailability(ev, type);
        res.json(result);
      } catch (err) {
        next(err);
      }
    },

    purchaseTicket: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await service.purchaseTicket(req.body);
        res.status(201).json(result);
      } catch (err) {
        next(err);
      }
    },
  };
}

// default controller used by runtime (keeps previous wiring)
const defaultRepo = new PrismaTicketsRepository();
const defaultService = new TicketsService(defaultRepo);
export const defaultTicketsController = createTicketsController(defaultService);
export default defaultTicketsController;

// named exports for router wiring convenience
export const createTicket = defaultTicketsController.createTicket;
export const listTickets = defaultTicketsController.listTickets;
export const getTicket = defaultTicketsController.getTicket;
export const updateTicket = defaultTicketsController.updateTicket;
export const deleteTicket = defaultTicketsController.deleteTicket;
export const availability = defaultTicketsController.availability;
export const purchaseTicket = defaultTicketsController.purchaseTicket;
