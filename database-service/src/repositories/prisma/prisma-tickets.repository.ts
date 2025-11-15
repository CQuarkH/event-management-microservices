// src/repositories/prisma/prisma-tickets.repository.ts
import { prisma } from "../../prisma/client.js";

export type TicketCreateInput = {
  eventId: string;
  type: string;
  price: number;
  quantityAvailable: number;
  quantitySold?: number;
};

export type TicketUpdateInput = Partial<{
  type: string;
  price: number;
  quantityAvailable: number;
  quantitySold: number;
}>;

export class PrismaTicketsRepository {
  async create(data: TicketCreateInput) {
    return prisma.ticket.create({ data });
  }

  async findById(id: string) {
    return prisma.ticket.findUnique({ where: { id } });
  }

  async findAll(filter: Record<string, any> = {}, pagination = { page: 1, pageSize: 100 }) {
    const skip = (pagination.page - 1) * pagination.pageSize;
    return prisma.ticket.findMany({
      where: filter,
      skip,
      take: pagination.pageSize,
    });
  }

  async update(id: string, data: TicketUpdateInput) {
    return prisma.ticket.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await prisma.ticket.delete({ where: { id } });
  }

  /**
   * Find ticket by eventId and type (e.g. general, VIP)
   */
  async findByEventAndType(eventId: string, type: string) {
    return prisma.ticket.findFirst({
      where: { eventId, type },
    });
  }

  /**
   * Atomic purchase attempt: decrement quantityAvailable and increment quantitySold
   * Returns true if update happened (enough stock), false otherwise.
   *
   * We use updateMany with a conditional where quantityAvailable >= qty to ensure atomicity.
   */
  async purchaseAtomic(ticketId: string, qty: number): Promise<boolean> {
    const res = await prisma.ticket.updateMany({
      where: {
        id: ticketId,
        quantityAvailable: { gte: qty },
      },
      data: {
        quantityAvailable: { decrement: qty },
        quantitySold: { increment: qty },
      },
    });
    // updateMany returns { count: number }
    return (res as any).count > 0;
  }
}
