import type { INotificationsRepository } from "../repositories/interfaces/i-notifications.repository.js";
import type { CreateNotificationDTO } from "../dto/notifications/create-notification.dto.js";
import type { UpdateNotificationDTO } from "../dto/notifications/update-notification.dto.js";
import { PrismaNotificationsRepository } from "../repositories/prisma/prisma-notifications.repository.js";

export class NotificationsService {
  constructor(private repo: INotificationsRepository) {}

  static default() {
    return new NotificationsService(new PrismaNotificationsRepository());
  }

  private validateType(t: string) {
    return t === "EMAIL" || t === "SMS";
  }

  async sendNotification(dto: CreateNotificationDTO) {
    if (!this.validateType(dto.type))
      throw new Error("Invalid notification type");
    if (!dto.message || dto.message.trim().length === 0)
      throw new Error("Message is required");
    if (!Array.isArray(dto.recipients) || dto.recipients.length === 0)
      throw new Error("Recipients required");

    // persist unsent
    const created = await this.repo.create({ ...dto, sentAt: null });

    // simulate send -> mark sentAt
    const sentAt = new Date();
    const updated = await this.repo.update(created.id, { sentAt });

    return updated;
  }

  async getNotificationById(id: string) {
    const n = await this.repo.findById(id);
    if (!n) throw new Error("Notification not found");
    return n;
  }

  async listNotifications(
    filter: Record<string, any> = {},
    pagination = { page: 1, pageSize: 100 }
  ) {
    return this.repo.findAll(filter, pagination);
  }

  async updateNotification(id: string, dto: UpdateNotificationDTO) {
    return this.repo.update(id, dto as any);
  }

  async deleteNotification(id: string) {
    return this.repo.delete(id);
  }
}
