import type { Request, Response, NextFunction } from "express";
import { PrismaNotificationsRepository } from "../repositories/prisma/prisma-notifications.repository.js";
import { NotificationsService } from "../services/notifications.service.js";

export function createNotificationsController(service: NotificationsService) {
  return {
    sendNotification: async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const created = await service.sendNotification(req.body);
        res.status(201).json(created);
      } catch (err) {
        next(err);
      }
    },

    listNotifications: async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const page = req.query.page ? Number(req.query.page) : 1;
        const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 100;
        const items = await service.listNotifications({}, { page, pageSize });
        res.json(items);
      } catch (err) {
        next(err);
      }
    },

    getNotification: async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const n = await service.getNotificationById(req.params.id);
        res.json(n);
      } catch (err) {
        next(err);
      }
    },

    updateNotification: async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const updated = await service.updateNotification(
          req.params.id,
          req.body
        );
        res.json(updated);
      } catch (err) {
        next(err);
      }
    },

    deleteNotification: async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        await service.deleteNotification(req.params.id);
        res.status(204).send();
      } catch (err) {
        next(err);
      }
    },
  };
}

const defaultController = createNotificationsController(
  NotificationsService.default()
);
export default defaultController;

export const sendNotification = defaultController.sendNotification;
export const listNotifications = defaultController.listNotifications;
export const getNotification = defaultController.getNotification;
export const updateNotification = defaultController.updateNotification;
export const deleteNotification = defaultController.deleteNotification;
