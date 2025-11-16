// src/repositories/prisma/prisma-attendees.repository.ts
import { prisma } from "../../prisma/client.js";
import type {
  IAttendeesRepository,
  AttendeeCreateInput,
  AttendeeEntity,
  AttendeeUpdateStatusInput,
} from "../interfaces/i-attendees.repository.js";

/**
 * Utilities: normalize status values between DB (UPPERCASE enums) and app (lowercase)
 * - DB uses: "CONFIRMED" | "UNCONFIRMED" (enum strings)
 * - App uses: "confirmed" | "unconfirmed"
 */

function fromPrismaStatus(
  s: string | null | undefined
): "confirmed" | "unconfirmed" {
  if (!s) return "unconfirmed";
  const upper = String(s).toUpperCase();
  if (upper === "CONFIRMED") return "confirmed";
  return "unconfirmed";
}

function toPrismaStatus(status?: string | null): string {
  // Accept either "confirmed"|"unconfirmed" (app) or already uppercase values.
  if (!status) return "UNCONFIRMED";
  const s = String(status).toUpperCase();
  if (s === "CONFIRMED") return "CONFIRMED";
  if (s === "UNCONFIRMED") return "UNCONFIRMED";
  // If we get an unexpected value, throw — this mirrors validation behaviour.
  throw new Error("Invalid status");
}

function mapPrismaAttendeeToEntity(a: any): AttendeeEntity {
  if (!a) return a;
  return {
    id: a.id,
    name: a.name,
    email: a.email ?? null,
    phone: a.phone ?? null,
    status: fromPrismaStatus(a.status),
    eventId: a.eventId ?? null,
    createdAt: a.createdAt,
  };
}

export class PrismaAttendeesRepository implements IAttendeesRepository {
  async create(data: AttendeeCreateInput): Promise<AttendeeEntity> {
    const statusForPrisma = toPrismaStatus(data.status ?? "unconfirmed");
    const created = await prisma.attendee.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone ?? null,
        // CAST HERE to avoid TS complaining about incompatible enum types at compile time
        status: statusForPrisma as any,
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
    const statusForPrisma = toPrismaStatus(data.status);
    const updated = await prisma.attendee.update({
      where: { id },
      data: { status: statusForPrisma as any },
    });
    return mapPrismaAttendeeToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.attendee.delete({ where: { id } });
  }
}
