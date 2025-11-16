// tests/unit/repositories/prisma-tickets.repository.spec.ts
import { PrismaTicketsRepository } from "../../../src/repositories/prisma/prisma-tickets.repository.js";
import { prisma } from "../../../src/prisma/client.js";
import { jest } from "@jest/globals";

describe("PrismaTicketsRepository (unit)", () => {
  let repo: PrismaTicketsRepository;

  beforeEach(() => {
    // Mock object for prisma.ticket with jest.fn() for every method used
    (prisma as any).ticket = {
      findUnique: jest.fn(),
      updateMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    repo = new PrismaTicketsRepository();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("findById -> returns found item or null", async () => {
    (prisma as any).ticket.findUnique.mockResolvedValue({
      id: "1",
      eventId: "e1",
    });
    const found = await repo.findById("1");
    expect((prisma as any).ticket.findUnique).toHaveBeenCalledWith({
      where: { id: "1" },
    });
    expect(found).toEqual(expect.objectContaining({ id: "1" }));

    // case not found
    (prisma as any).ticket.findUnique.mockResolvedValue(null);
    const notFound = await repo.findById("does-not-exist");
    expect(notFound).toBeNull();
  });

  test("findAll -> respects pagination and orderBy", async () => {
    (prisma as any).ticket.findMany.mockResolvedValue([{ id: "t1" }]);
    const items = await repo.findAll({}, { page: 2, pageSize: 5 });
    expect((prisma as any).ticket.findMany).toHaveBeenCalledWith({
      where: {},
      skip: 5,
      take: 5,
      orderBy: { createdAt: "desc" },
    });
    expect(Array.isArray(items)).toBe(true);
  });

  test("create -> forwards transformed data to prisma.ticket.create", async () => {
    const payload = {
      eventId: "e1",
      type: "general",
      price: 10,
      quantityAvailable: 100,
    };

    // Prisma client is expected to receive normalized enum value (e.g. "GENERAL")
    (prisma as any).ticket.create.mockResolvedValue({
      id: "created",
      eventId: payload.eventId,
      type: "GENERAL",
      price: payload.price,
      quantityAvailable: payload.quantityAvailable,
      quantitySold: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const created = await repo.create(payload as any);

    // We assert prisma.create called with a data object that contains the Prisma-shaped fields
    expect((prisma as any).ticket.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        eventId: "e1",
        price: 10,
        quantityAvailable: 100,
        quantitySold: 0,
        // type normalized to Prisma enum string
        type: "GENERAL",
      }),
    });

    // repo maps the returned Prisma object back to app-level TicketEntity -> id should be present
    expect(created).toEqual(expect.objectContaining({ id: "created" }));
  });

  test("update -> forwards to prisma.ticket.update", async () => {
    (prisma as any).ticket.update.mockResolvedValue({
      id: "t1",
      price: 50,
      type: "GENERAL",
      quantityAvailable: 10,
      quantitySold: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const up = await repo.update("t1", { price: 50 });
    expect((prisma as any).ticket.update).toHaveBeenCalledWith({
      where: { id: "t1" },
      data: { price: 50 },
    });
    expect(up).toEqual(expect.objectContaining({ id: "t1" }));
  });

  test("delete -> forwards to prisma.ticket.delete", async () => {
    (prisma as any).ticket.delete.mockResolvedValue({});
    await repo.delete("t1");
    expect((prisma as any).ticket.delete).toHaveBeenCalledWith({
      where: { id: "t1" },
    });
  });

  test("findByEventAndType -> returns first match or null (type normalized)", async () => {
    (prisma as any).ticket.findFirst.mockResolvedValue({
      id: "t1",
      eventId: "e1",
      type: "GENERAL",
    });
    const res = await repo.findByEventAndType("e1", "general");
    // repository normalizes 'general' -> 'GENERAL' before calling prisma
    expect((prisma as any).ticket.findFirst).toHaveBeenCalledWith({
      where: { eventId: "e1", type: "GENERAL" },
    });
    expect(res).toEqual(expect.objectContaining({ id: "t1" }));

    (prisma as any).ticket.findFirst.mockResolvedValue(null);
    const res2 = await repo.findByEventAndType("e1", "unknown");
    expect(res2).toBeNull();
  });

  test("purchaseAtomic -> returns true when updateMany affects a row, false otherwise", async () => {
    (prisma as any).ticket.updateMany.mockResolvedValue({ count: 1 });
    const ok = await repo.purchaseAtomic("t1", 2);
    expect((prisma as any).ticket.updateMany).toHaveBeenCalled();
    expect(ok).toBe(true);

    (prisma as any).ticket.updateMany.mockResolvedValue({ count: 0 });
    const nok = await repo.purchaseAtomic("t1", 2);
    expect(nok).toBe(false);
  });
});
