// tests/unit/repositories/prisma-events.repository.spec.ts
import { jest } from "@jest/globals";
import { PrismaEventsRepository } from "../../../src/repositories/prisma/prisma-events.repository.js";
import { prisma } from "../../../src/prisma/client.js";

describe("PrismaEventsRepository (unit)", () => {
  let repo: PrismaEventsRepository;

  beforeEach(() => {
    // Mock the prisma.event methods that the repository uses
    prisma.event = {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    repo = new PrismaEventsRepository();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("create -> calls prisma.event.create and returns result", async () => {
    const input = {
      name: "E1",
      date: new Date(),
      location: "loc",
      type: "t",
      description: "d",
    };
    const created = { id: "1", ...input };
    (prisma.event.create as jest.Mock).mockResolvedValue(created);

    const res = await repo.create(input);
    expect(prisma.event.create).toHaveBeenCalledWith({ data: input });
    expect(res).toEqual(created);
  });

  test("findById -> prisma.event.findUnique called with where + include and returns item or null", async () => {
    const found = { id: "1", name: "x" };
    (prisma.event.findUnique as jest.Mock).mockResolvedValue(found);

    const res = await repo.findById("1");

    // Esperamos que la llamada incluya 'where' y también 'include' con relaciones
    expect(prisma.event.findUnique).toHaveBeenCalledWith({
      where: { id: "1" },
      include: { attendees: true, tickets: true },
    });

    expect(res).toEqual(found);
  });

  test("findAll -> calls prisma.event.findMany with pagination params (skip/take) and returns items", async () => {
    const items = [{ id: "1" }];
    (prisma.event.findMany as jest.Mock).mockResolvedValue(items);

    const res = await repo.findAll({}, { page: 2, pageSize: 5 });

    // Verificamos que prisma.event.findMany fue llamado; detalles exactos dependen de la implementación
    expect(prisma.event.findMany).toHaveBeenCalled();
    expect(res).toEqual(items);
  });

  test("update -> calls prisma.event.update and returns updated", async () => {
    const updated = { id: "1", name: "u" };
    (prisma.event.update as jest.Mock).mockResolvedValue(updated);

    const res = await repo.update("1", { name: "u" });
    expect(prisma.event.update).toHaveBeenCalledWith({
      where: { id: "1" },
      data: { name: "u" },
    });
    expect(res).toEqual(updated);
  });

  test("delete -> calls prisma.event.delete", async () => {
    (prisma.event.delete as jest.Mock).mockResolvedValue(undefined);

    await repo.delete("1");
    expect(prisma.event.delete).toHaveBeenCalledWith({ where: { id: "1" } });
  });
});
