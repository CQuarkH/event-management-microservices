import { prisma } from "../../prisma/client.js";
import type { INotificationsRepository, Notification } from "../interfaces/i-notifications.repository.js";

export class PrismaNotificationsRepository implements INotificationsRepository {
  async create(data: { type: "EMAIL" | "SMS"; message: string; recipients: string[]; sentAt?: Date | null; }) {
    const created = await prisma.notification.create({
      data: {
        type: data.type,
        message: data.message,
        recipients: { set: data.recipients },
        sentAt: data.sentAt ?? null,
      },
    });
    return created as unknown as Notification;
  }

  async findById(id: string) {
    const res = await prisma.notification.findUnique({ where: { id } });
    return (res as unknown) as Notification | null;
  }

  async findAll(_filter: Record<string, any> = {}, pagination = { page: 1, pageSize: 100 }) {
    const skip = (pagination.page - 1) * pagination.pageSize;
    const take = pagination.pageSize;
    const list = await prisma.notification.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });
    return list as unknown as Notification[];
  }

  async update(id: string, data: Partial<any>) {
    const upd = await prisma.notification.update({
      where: { id },
      data: {
        ...(data.message !== undefined ? { message: data.message } : {}),
        ...(data.recipients !== undefined ? { recipients: { set: data.recipients } } : {}),
        ...(data.sentAt !== undefined ? { sentAt: data.sentAt } : {}),
        ...(data.type !== undefined ? { type: data.type } : {}),
      },
    });
    return upd as unknown as Notification;
  }

  async delete(id: string) {
    await prisma.notification.delete({ where: { id } });
  }
}
