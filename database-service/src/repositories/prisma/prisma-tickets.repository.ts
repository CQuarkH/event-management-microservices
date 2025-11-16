// src/repositories/prisma/prisma-tickets.repository.ts
import { prisma } from "../../prisma/client.js";
import { TicketType } from "@prisma/client";

/* ---------- Helpers: normalización entre app-level y Prisma enums ---------- */

function toPrismaTicketType(t?: string | null): TicketType {
  if (!t) return TicketType.GENERAL;
  const s = String(t).trim().toUpperCase();
  if (s === "GENERAL") return TicketType.GENERAL;
  if (s === "VIP") return TicketType.VIP;
  throw new Error(`Invalid ticket type: ${t}`);
}

/**
 * Retornamos siempre valores en MAYÚSCULAS ("GENERAL" | "VIP") para que
 * la API y los tests trabajen con la misma representación del enum.
 */
function fromPrismaTicketType(t?: TicketType | null): string {
  if (!t) return "GENERAL";
  if (t === TicketType.VIP) return "VIP";
  return "GENERAL";
}

/* ---------- Tipos locales del repositorio (app-level) ---------- */

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

export type TicketEntity = {
  id: string;
  type: string; // "GENERAL" | "VIP"
  price: number;
  quantityAvailable: number;
  quantitySold: number;
  eventId?: string | null;
};

export type Pagination = { page: number; pageSize: number };

export interface ITicketsRepository {
  create(data: {
    eventId?: string | null;
    type: string;
    price: number;
    quantityAvailable: number;
  }): Promise<TicketEntity>;

  findById(id: string): Promise<TicketEntity | null>;

  findAll(
    filter?: Record<string, any>,
    pagination?: Pagination
  ): Promise<TicketEntity[]>;

  update(id: string, data: Partial<TicketEntity>): Promise<TicketEntity>;

  delete(id: string): Promise<void>;

  findByEventAndType(
    eventId: string,
    type: string
  ): Promise<TicketEntity | null>;

  purchaseAtomic(ticketId: string, qty: number): Promise<boolean>;
}

/* ---------- Implementación usando Prisma ---------- */

function mapPrismaTicketToEntity(t: any): TicketEntity {
  return {
    id: t.id,
    type: fromPrismaTicketType(t.type), // ahora devuelve "GENERAL" o "VIP"
    price: t.price,
    quantityAvailable: t.quantityAvailable,
    quantitySold: t.quantitySold,
    eventId: t.eventId ?? null,
  };
}

export class PrismaTicketsRepository implements ITicketsRepository {
  async create(data: TicketCreateInput) {
    const prismaType = toPrismaTicketType(data.type);
    const payload = {
      eventId: data.eventId ?? null,
      type: prismaType,
      price: data.price,
      quantityAvailable: data.quantityAvailable,
      quantitySold: data.quantitySold ?? 0,
    };
    const created = await prisma.ticket.create({ data: payload });
    return mapPrismaTicketToEntity(created);
  }

  async findById(id: string) {
    const found = await prisma.ticket.findUnique({ where: { id } });
    if (!found) return null;
    return mapPrismaTicketToEntity(found);
  }

  async findAll(
    filter: Record<string, any> = {},
    pagination = { page: 1, pageSize: 100 }
  ) {
    const skip = (pagination.page - 1) * pagination.pageSize;
    const take = pagination.pageSize;
    const items = await prisma.ticket.findMany({
      where: filter,
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });
    return items.map(mapPrismaTicketToEntity);
  }

  async update(id: string, data: TicketUpdateInput) {
    const toUpdate: any = { ...data };
    if (typeof data.type === "string") {
      toUpdate.type = toPrismaTicketType(data.type);
    }
    const updated = await prisma.ticket.update({
      where: { id },
      data: toUpdate,
    });
    return mapPrismaTicketToEntity(updated);
  }

  async delete(id: string) {
    await prisma.ticket.delete({ where: { id } });
  }

  /**
   * Find ticket by eventId and type (e.g. general, VIP)
   *
   * Nota: si el tipo pasado NO es válido, devolvemos null (no lanzamos),
   * para que las llamadas (controladores/tests) obtengan `null` en lugar de error.
   */
  async findByEventAndType(eventId: string, type: string) {
    let prismaType: TicketType;
    try {
      prismaType = toPrismaTicketType(type);
    } catch (err) {
      return null;
    }

    const t = await prisma.ticket.findFirst({
      where: { eventId, type: prismaType },
    });
    if (!t) return null;
    return mapPrismaTicketToEntity(t);
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
    return (res as any).count > 0;
  }
}
