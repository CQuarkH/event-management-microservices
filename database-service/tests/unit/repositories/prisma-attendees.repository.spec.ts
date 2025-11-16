import { jest } from "@jest/globals";
import { PrismaAttendeesRepository } from "../../../src/repositories/prisma/prisma-attendees.repository.js";
import { prisma } from "../../../src/prisma/client.js";

describe("PrismaAttendeesRepository (unit)", () => {
  let repo;

  beforeEach(() => {
    // Mock minimal api de prisma.attendee requerida por el repositorio
    prisma.attendee = {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    repo = new PrismaAttendeesRepository();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("create -> calls prisma.attendee.create", async () => {
    const input = { name: "A", email: "a@b.com" };
    const created = {
      id: "1",
      ...input,
      status: "unconfirmed",
      phone: null,
      eventId: null,
      createdAt: new Date(),
    };
    prisma.attendee.create.mockResolvedValue(created);

    const res = await repo.create(input);
    expect(prisma.attendee.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ name: "A", email: "a@b.com" }),
    });

    // No exigir igualdad exacta — el repo puede mapear/normalizar campos
    expect(res).toMatchObject({
      id: "1",
      name: "A",
      email: "a@b.com",
      status: "unconfirmed",
      eventId: null,
    });
  });

  test("findById -> calls prisma.attendee.findUnique with include", async () => {
    const found = { id: "1", name: "A" };
    prisma.attendee.findUnique.mockResolvedValue(found);

    const res = await repo.findById("1");
    expect(prisma.attendee.findUnique).toHaveBeenCalledWith({
      where: { id: "1" },
      include: { event: true },
    });

    // repo puede rellenar/normalizar campos (status/eventId/phone)
    expect(res).not.toBeNull();
    expect(res).toMatchObject({
      id: "1",
      name: "A",
      // si prisma no devuelve status, el repo debería proveer un valor por defecto
      status: expect.any(String),
    });
  });

  test("findAll -> calls prisma.attendee.findMany", async () => {
    const items = [{ id: "1" }];
    prisma.attendee.findMany.mockResolvedValue(items);

    const res = await repo.findAll({}, { page: 1, pageSize: 10 });
    expect(prisma.attendee.findMany).toHaveBeenCalled();
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBe(items.length);
    expect(res[0]).toMatchObject({ id: "1", status: expect.any(String) });
  });

  test("updateStatus -> calls prisma.attendee.update", async () => {
    // Simulamos lo que Prisma retornaría (enum en mayúsculas)
    const prismaUpdated = {
      id: "1",
      status: "CONFIRMED", // Prisma enum style (simulado)
      createdAt: new Date(),
    };
    prisma.attendee.update.mockResolvedValue(prismaUpdated);

    const res = await repo.updateStatus("1", { status: "confirmed" });

    // El repositorio debe transformar 'confirmed' -> 'CONFIRMED' al llamar a Prisma.
    expect(prisma.attendee.update).toHaveBeenCalledWith({
      where: { id: "1" },
      data: { status: "CONFIRMED" },
    });

    // Y devolver un objeto normalizado en minúsculas al dominio
    expect(res).toMatchObject({ id: "1", status: "confirmed" });
  });

  test("delete -> calls prisma.attendee.delete", async () => {
    prisma.attendee.delete.mockResolvedValue(undefined);
    await repo.delete("1");
    expect(prisma.attendee.delete).toHaveBeenCalledWith({ where: { id: "1" } });
  });
});
