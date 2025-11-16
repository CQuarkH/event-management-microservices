// src/controllers/events.controller.ts
import type { Request, Response, NextFunction } from "express";
import { PrismaEventsRepository } from "../repositories/prisma/prisma-events.repository.js";
import { EventsService } from "../services/events.service.js";

export function createEventsController(service: EventsService) {
  return {
    createEvent: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const created = await service.createEvent(req.body);
        res.status(201).json(created);
      } catch (err) {
        next(err);
      }
    },

    listEvents: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const page = req.query.page ? Number(req.query.page) : 1;
        const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 100;
        const events = await service.listEvents({}, { page, pageSize });
        res.json(events);
      } catch (err) {
        next(err);
      }
    },

    getEvent: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const ev = await service.getEventById(req.params.id);
        res.json(ev);
      } catch (err) {
        next(err);
      }
    },

    updateEvent: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const updated = await service.updateEvent(req.params.id, req.body);
        res.json(updated);
      } catch (err) {
        next(err);
      }
    },

    deleteEvent: async (req: Request, res: Response, next: NextFunction) => {
      try {
        await service.deleteEvent(req.params.id);
        res.status(204).send();
      } catch (err) {
        next(err);
      }
    },
  };
}

const defaultRepo = new PrismaEventsRepository();
const defaultService = new EventsService(defaultRepo);
export const defaultEventsController = createEventsController(defaultService);
export default defaultEventsController;

export const createEvent = defaultEventsController.createEvent;
export const listEvents = defaultEventsController.listEvents;
export const getEvent = defaultEventsController.getEvent;
export const updateEvent = defaultEventsController.updateEvent;
export const deleteEvent = defaultEventsController.deleteEvent;
