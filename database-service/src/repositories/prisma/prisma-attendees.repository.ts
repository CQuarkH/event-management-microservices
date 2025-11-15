// src/repositories/prisma/prisma-attendees.repository.ts
import { prisma } from "../../prisma/client.js";
import type {
  IAttendeesRepository,
  AttendeeCreateInput,
  AttendeeEntity,
  AttendeeUpdateStatusInput,
} from "../interfaces/i-attendees.repository.js";

export class PrismaAttendeesRepository implements IAttendeesRepository {
  async create(data: AttendeeCreateInput): Promise<AttendeeEntity> {
    const created = await prisma.attendee.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone ?? null,
        status: data.status ?? "unconfirmed",
        eventId: data.eventId ?? null,
      },
    });
    return created as AttendeeEntity;
  }

  async findById(id: string): Promise<AttendeeEntity | null> {
    const found = await prisma.attendee.findUnique({
      where: { id },
      include: { event: true }, // include event for convenience
    });
    return found as unknown as AttendeeEntity | null;
  }

  async findAll(
    _filter: Record<string, any> = {},
    pagination = { page: 1, pageSize: 100 }
  ): Promise<AttendeeEntity[]> {
    const skip = (pagination.page - 1) * pagination.pageSize;
    const take = pagination.pageSize;
    const items = await prisma.attendee.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });
    return items as AttendeeEntity[];
  }

  async updateStatus(
    id: string,
    data: AttendeeUpdateStatusInput
  ): Promise<AttendeeEntity> {
    const updated = await prisma.attendee.update({
      where: { id },
      data: { status: data.status },
    });
    return updated as AttendeeEntity;
  }

  async delete(id: string): Promise<void> {
    await prisma.attendee.delete({ where: { id } });
  }
}
