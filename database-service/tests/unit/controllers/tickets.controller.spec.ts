// tests/unit/controllers/tickets.controller.spec.ts
import { jest } from "@jest/globals";
import { createTicketsController } from "../../../src/controllers/tickets.controller.js";

describe("Tickets Controller (unit) via factory", () => {
  let serviceMock: any;
  let controller: ReturnType<typeof createTicketsController>;

  beforeEach(() => {
    serviceMock = {
      createTicket: jest.fn(),
      listTickets: jest.fn(),
      getTicketById: jest.fn(),
      updateTicket: jest.fn(),
      deleteTicket: jest.fn(),
      checkAvailability: jest.fn(),
      purchaseTicket: jest.fn(),
    };
    controller = createTicketsController(serviceMock);
  });

  test("createTicket -> returns 201 & body", async () => {
    const req: any = { body: { eventId: "e1", type: "general", price: 1, quantityAvailable: 1 } };
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res: any = { status };
    const next = jest.fn();
    serviceMock.createTicket.mockResolvedValue({ id: "t1" });

    await controller.createTicket(req, res, next);

    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalledWith({ id: "t1" });
    expect(next).not.toHaveBeenCalled();
  });

  test("createTicket -> forwards error to next", async () => {
    const req: any = { body: {} };
    const res: any = { status: jest.fn(() => ({ json: jest.fn() })) };
    const next = jest.fn();
    const err = new Error("boom");
    serviceMock.createTicket.mockRejectedValue(err);

    await controller.createTicket(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });

  test("availability -> returns availability object", async () => {
    const req: any = { query: { eventId: "e1", type: "general" } };
    const json = jest.fn();
    const res: any = { json };
    const next = jest.fn();
    const avail = { available: true, quantityAvailable: 5 };
    serviceMock.checkAvailability.mockResolvedValue(avail);

    await controller.availability(req, res, next);
    expect(json).toHaveBeenCalledWith(avail);
  });

  test("purchaseTicket -> success and error forwarding", async () => {
    const req: any = { body: { eventId: "e1", ticketType: "general", quantity: 1 } };
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res: any = { status };
    const next = jest.fn();

    serviceMock.purchaseTicket.mockResolvedValue({ ticketId: "t1", quantity: 1, status: "purchased" });
    await controller.purchaseTicket(req, res, next);
    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalledWith({ ticketId: "t1", quantity: 1, status: "purchased" });

    const err = new Error("not enough");
    serviceMock.purchaseTicket.mockRejectedValue(err);
    await controller.purchaseTicket(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });
});
