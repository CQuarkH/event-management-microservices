// src/repositories/prisma/prisma-events.repository.ts
import type {
  IEventsRepository,
  EventCreateInput,
  EventUpdateInput,
} from "../interfaces/i-events.repository.js";
import { prisma } from "../../prisma/client.js";

export class PrismaEventsRepository implements IEventsRepository {
  async create(data: EventCreateInput) {
    return prisma.event.create({
      data: {
        name: data.name,
        date: data.date,
        location: data.location,
        type: data.type,
        description: data.description ?? null,
      },
    });
  }

  async findById(id: string) {
    return prisma.event.findUnique({
      where: { id },
      include: { tickets: true, attendees: true },
    });
  }

  async findAll(
    _filter: Record<string, any> = {},
    pagination: { page: number; pageSize: number } = { page: 1, pageSize: 100 }
  ) {
    const skip = (pagination.page - 1) * pagination.pageSize;
    const take = pagination.pageSize;
    return prisma.event.findMany({
      skip,
      take,
      orderBy: { date: "asc" },
    });
  }

  async update(id: string, data: EventUpdateInput) {
    // map date if provided
    const mapped: any = { ...data };
    if (mapped.date) mapped.date = mapped.date;
    return prisma.event.update({
      where: { id },
      data: mapped,
    });
  }

  async delete(id: string) {
    await prisma.event.delete({ where: { id } });
  }
}
