// src/repositories/prisma/prisma-attendees.repository.ts
import { prisma } from "../../prisma/client.js";
import type {
  IAttendeesRepository,
  AttendeeCreateInput,
  AttendeeEntity,
  AttendeeUpdateStatusInput,
} from "../interfaces/i-attendees.repository.js";
import { AttendeeStatus } from "@prisma/client";


function fromPrismaStatus(
  s: AttendeeStatus | null | undefined
): "confirmed" | "unconfirmed" {
  if (!s) return "unconfirmed";
  if (s === AttendeeStatus.CONFIRMED) return "confirmed";
  return "unconfirmed";
}

function mapPrismaAttendeeToEntity(a: any): AttendeeEntity {
  return {
    id: a.id,
    name: a.name,
    email: a.email,
    phone: a.phone ?? null,
    status: fromPrismaStatus(a.status),
    eventId: a.eventId ?? null,
    createdAt: a.createdAt,
  };
}

function normalizeStatusForPrisma(status?: string) {
  if (!status) return AttendeeStatus.UNCONFIRMED;
  const s = String(status).toUpperCase();
  if (!Object.values(AttendeeStatus).includes(s as AttendeeStatus)) {
    throw new Error("Invalid status");
  }
  return s as AttendeeStatus;
}

export class PrismaAttendeesRepository implements IAttendeesRepository {
  async create(data: AttendeeCreateInput): Promise<AttendeeEntity> {
    const statusForPrisma = normalizeStatusForPrisma(data.status);
    const created = await prisma.attendee.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone ?? null,
        status: statusForPrisma,
        eventId: data.eventId ?? null,
      },
    });
    return mapPrismaAttendeeToEntity(created);
  }

  async findById(id: string): Promise<AttendeeEntity | null> {
    const found = await prisma.attendee.findUnique({
      where: { id },
      include: { event: true },
    });
    if (!found) return null;
    return mapPrismaAttendeeToEntity(found);
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
    return items.map(mapPrismaAttendeeToEntity);
  }

  async updateStatus(
    id: string,
    data: AttendeeUpdateStatusInput
  ): Promise<AttendeeEntity> {
    const statusForPrisma = normalizeStatusForPrisma(data.status);
    const updated = await prisma.attendee.update({
      where: { id },
      data: { status: statusForPrisma },
    });
    return mapPrismaAttendeeToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.attendee.delete({ where: { id } });
  }
}
