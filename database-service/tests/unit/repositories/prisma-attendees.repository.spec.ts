// tests/unit/repositories/prisma-attendees.repository.spec.ts
import { jest } from "@jest/globals";
import { PrismaAttendeesRepository } from "../../../src/repositories/prisma/prisma-attendees.repository.js";
import { prisma } from "../../../src/prisma/client.js";

describe("PrismaAttendeesRepository (unit)", () => {
  let repo: PrismaAttendeesRepository;

  beforeEach(() => {
    prisma.attendee = {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

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
    };
    (prisma.attendee.create as jest.Mock).mockResolvedValue(created);

    const res = await repo.create(input as any);
    expect(prisma.attendee.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ name: "A", email: "a@b.com" }),
    });
    expect(res).toEqual(created);
  });

  test("findById -> calls prisma.attendee.findUnique with include", async () => {
    const found = { id: "1", name: "A" };
    (prisma.attendee.findUnique as jest.Mock).mockResolvedValue(found);

    const res = await repo.findById("1");
    expect(prisma.attendee.findUnique).toHaveBeenCalledWith({
      where: { id: "1" },
      include: { event: true },
    });
    expect(res).toEqual(found);
  });

  test("findAll -> calls prisma.attendee.findMany", async () => {
    const items = [{ id: "1" }];
    (prisma.attendee.findMany as jest.Mock).mockResolvedValue(items);

    const res = await repo.findAll({}, { page: 1, pageSize: 10 });
    expect(prisma.attendee.findMany).toHaveBeenCalled();
    expect(res).toEqual(items);
  });

  test("updateStatus -> calls prisma.attendee.update", async () => {
    const updated = { id: "1", status: "confirmed" };
    (prisma.attendee.update as jest.Mock).mockResolvedValue(updated);

    const res = await repo.updateStatus("1", { status: "confirmed" });
    expect(prisma.attendee.update).toHaveBeenCalledWith({
      where: { id: "1" },
      data: { status: "confirmed" },
    });
    expect(res).toEqual(updated);
  });

  test("delete -> calls prisma.attendee.delete", async () => {
    (prisma.attendee.delete as jest.Mock).mockResolvedValue(undefined);
    await repo.delete("1");
    expect(prisma.attendee.delete).toHaveBeenCalledWith({ where: { id: "1" } });
  });
});
