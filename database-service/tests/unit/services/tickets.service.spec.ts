// tests/unit/services/tickets.service.spec.ts
import { jest } from "@jest/globals";
import { TicketsService } from "../../../src/services/tickets.service.js";

describe("TicketsService (unit)", () => {
  let repoMock: any;
  let service: TicketsService;

  const ticket = {
    id: "t1",
    eventId: "e1",
    type: "general",
    price: 10,
    quantityAvailable: 5,
    quantitySold: 0,
  };

  beforeEach(() => {
    repoMock = {
      findByEventAndType: jest.fn(),
      purchaseAtomic: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    service = new TicketsService(repoMock);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("checkAvailability -> returns availability when ticket exists", async () => {
    repoMock.findByEventAndType.mockResolvedValue(ticket);
    const res = await service.checkAvailability("e1", "general");
    expect(repoMock.findByEventAndType).toHaveBeenCalledWith("e1", "general");
    expect(res).toEqual({ available: true, quantityAvailable: 5 });
  });

  test("checkAvailability -> returns not available when ticket not found", async () => {
    repoMock.findByEventAndType.mockResolvedValue(null);
    const res = await service.checkAvailability("e1", "unknown");
    expect(res).toEqual({ available: false, quantityAvailable: 0 });
  });

  test("purchaseTicket -> success path when atomic purchase succeeds", async () => {
    repoMock.findByEventAndType.mockResolvedValue(ticket);
    repoMock.purchaseAtomic.mockResolvedValue(true);
    repoMock.findById.mockResolvedValue({ ...ticket, quantityAvailable: 3, quantitySold: 2 });

    const payload = { eventId: "e1", ticketType: "general", quantity: 2 };
    const res = await service.purchaseTicket(payload);
    expect(repoMock.findByEventAndType).toHaveBeenCalledWith("e1", "general");
    expect(repoMock.purchaseAtomic).toHaveBeenCalledWith("t1", 2);
    // adapt expectation to actual shape returned by your service
    expect(res).toEqual({ ticketId: "t1", quantity: 2, status: "purchased" });
  });

  test("purchaseTicket -> throws when not enough stock (atomic returns false)", async () => {
    repoMock.findByEventAndType.mockResolvedValue(ticket);
    repoMock.purchaseAtomic.mockResolvedValue(false);

    await expect(
      service.purchaseTicket({ eventId: "e1", ticketType: "general", quantity: 10 })
    ).rejects.toThrow("Not enough tickets available");
  });

  test("createTicket -> validation errors and success", async () => {
    // invalid type -> should throw
    await expect(
      service.createTicket({ eventId: "e1", type: "invalid", price: 1, quantityAvailable: 1 } as any)
    ).rejects.toThrow("Invalid ticket type");

    // negative price -> throw
    await expect(
      service.createTicket({ eventId: "e1", type: "general", price: -1, quantityAvailable: 1 } as any)
    ).rejects.toThrow("Invalid price");

    // invalid quantity -> throw
    await expect(
      service.createTicket({ eventId: "e1", type: "general", price: 1, quantityAvailable: -5 } as any)
    ).rejects.toThrow();

    // success path
    (repoMock.create as jest.Mock).mockResolvedValue({ id: "tx", eventId: "e1" });
    const created = await service.createTicket({ eventId: "e1", type: "general", price: 1, quantityAvailable: 10 });
    expect(repoMock.create).toHaveBeenCalled();
    expect(created).toEqual({ id: "tx", eventId: "e1" });
  });

  test("crud forwards to repo", async () => {
    (repoMock.findById as jest.Mock).mockResolvedValue(ticket);
    const got = await service.getTicketById("t1");
    expect(repoMock.findById).toHaveBeenCalledWith("t1");
    expect(got).toEqual(ticket);

    (repoMock.findAll as jest.Mock).mockResolvedValue([ticket]);
    const list = await service.listTickets({}, { page: 1, pageSize: 10 });
    expect(repoMock.findAll).toHaveBeenCalled();

    (repoMock.update as jest.Mock).mockResolvedValue({ ...ticket, price: 20 });
    const updated = await service.updateTicket("t1", { price: 20 });
    expect(repoMock.update).toHaveBeenCalledWith("t1", { price: 20 });
    expect(updated.price).toBe(20);

    (repoMock.delete as jest.Mock).mockResolvedValue(undefined);
    await service.deleteTicket("t1");
    expect(repoMock.delete).toHaveBeenCalledWith("t1");
  });
});
