import { jest } from "@jest/globals";

jest.unstable_mockModule("../../../src/prisma/client.js", () => {
  return {
    prisma: {
      notification: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    },
  };
});

describe("PrismaNotificationsRepository (unit)", () => {
  let repoModule: any;
  let repo: any;
  let prisma: any;

  beforeAll(async () => {
    repoModule = await import(
      "../../../src/repositories/prisma/prisma-notifications.repository.js"
    );
    const client = await import("../../../src/prisma/client.js");
    prisma = client.prisma;
    repo = new repoModule.PrismaNotificationsRepository();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("create forwards to prisma.notification.create", async () => {
    (prisma.notification.create as jest.Mock).mockResolvedValue({ id: "n1" });
    const res = await repo.create({
      type: "EMAIL",
      message: "x",
      recipients: ["a@x.com"],
    });
    expect(prisma.notification.create).toHaveBeenCalled();
    expect(res).toEqual({ id: "n1" });
  });

  test("findById calls findUnique", async () => {
    (prisma.notification.findUnique as jest.Mock).mockResolvedValue({
      id: "n1",
    });
    const res = await repo.findById("n1");
    expect(prisma.notification.findUnique).toHaveBeenCalledWith({
      where: { id: "n1" },
    });
    expect(res).toEqual({ id: "n1" });
  });

  test("findAll calls findMany with pagination", async () => {
    (prisma.notification.findMany as jest.Mock).mockResolvedValue([
      { id: "n1" },
    ]);
    const res = await repo.findAll({}, { page: 2, pageSize: 5 });
    expect(prisma.notification.findMany).toHaveBeenCalled();
    expect(res).toEqual([{ id: "n1" }]);
  });

  test("update/delete forward", async () => {
    (prisma.notification.update as jest.Mock).mockResolvedValue({
      id: "n1",
      message: "x",
    });
    const u = await repo.update("n1", { message: "x" });
    expect(prisma.notification.update).toHaveBeenCalled();
    expect(u).toEqual({ id: "n1", message: "x" });

    (prisma.notification.delete as jest.Mock).mockResolvedValue({ id: "n1" });
    await repo.delete("n1");
    expect(prisma.notification.delete).toHaveBeenCalledWith({
      where: { id: "n1" },
    });
  });
});
