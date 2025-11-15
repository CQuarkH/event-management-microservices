// src/controllers/attendees.controller.ts
import type { Request, Response, NextFunction } from "express";
import { PrismaAttendeesRepository } from "../repositories/prisma/prisma-attendees.repository.js";
import { AttendeesService } from "../services/attendees.service.js";

export function createAttendeesController(service: AttendeesService) {
  return {
    createAttendee: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const created = await service.createAttendee(req.body);
        res.status(201).json(created);
      } catch (err) {
        next(err);
      }
    },

    listAttendees: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const page = req.query.page ? Number(req.query.page) : 1;
        const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 100;
        const items = await service.listAttendees({}, { page, pageSize });
        res.json(items);
      } catch (err) {
        next(err);
      }
    },

    getAttendee: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const a = await service.getAttendeeById(req.params.id);
        res.json(a);
      } catch (err) {
        next(err);
      }
    },

    patchStatus: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const updated = await service.updateStatus(req.params.id, req.body);
        res.json(updated);
      } catch (err) {
        next(err);
      }
    },
  };
}

const defaultRepo = new PrismaAttendeesRepository();
const defaultService = new AttendeesService(defaultRepo);
export const defaultAttendeesController =
  createAttendeesController(defaultService);
export default defaultAttendeesController;

// named exports for backward compatibility
export const createAttendee = defaultAttendeesController.createAttendee;
export const listAttendees = defaultAttendeesController.listAttendees;
export const getAttendee = defaultAttendeesController.getAttendee;
export const patchStatus = defaultAttendeesController.patchStatus;
