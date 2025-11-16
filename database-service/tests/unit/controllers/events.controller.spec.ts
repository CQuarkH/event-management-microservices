// tests/unit/controllers/events.controller.spec.ts
import { jest } from "@jest/globals";
import { createEventsController } from "../../../src/controllers/events.controller.js";
import type { EventsService } from "../../../src/services/events.service.js";
import type { Request, Response, NextFunction } from "express";

function makeRes() {
  const json = jest.fn();
  const status = jest.fn(() => ({ json, send: jest.fn() }));
  const send = jest.fn();
  return {
    json,
    status,
    send,
  } as unknown as Response & {
    json: jest.Mock;
    status: jest.Mock;
    send: jest.Mock;
  };
}

function makeReq(body = {}, params = {}, query = {}) {
  return { body, params, query } as unknown as Request;
}

describe("EventsController (unit)", () => {
  let serviceMock: Partial<Record<keyof EventsService, jest.Mock>>;
  let controller: ReturnType<typeof createEventsController>;
  let next: NextFunction;

  beforeEach(() => {
    serviceMock = {
      createEvent: jest.fn(),
      listEvents: jest.fn(),
      getEventById: jest.fn(),
      updateEvent: jest.fn(),
      deleteEvent: jest.fn(),
    };

    // @ts-ignore - we only need matching functions
    controller = createEventsController(serviceMock as any);
    next = jest.fn();
  });

  test("createEvent - success -> 201 + json", async () => {
    const req = makeReq({ name: "x", date: "2026-01-01T00:00:00Z" });
    const res = makeRes();
    (serviceMock.createEvent as jest.Mock).mockResolvedValue({
      id: "1",
      name: "x",
    });

    await controller.createEvent(req, res as any, next);

    expect(serviceMock.createEvent).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: "1", name: "x" });
  });

  test("createEvent - service throws -> calls next with error", async () => {
    const req = makeReq({ name: "bad" });
    const res = makeRes();
    const error = new Error("boom");
    (serviceMock.createEvent as jest.Mock).mockRejectedValue(error);

    await controller.createEvent(req, res as any, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  test("getEvent - success -> json", async () => {
    const req = makeReq({}, { id: "1" });
    const res = makeRes();
    (serviceMock.getEventById as jest.Mock).mockResolvedValue({ id: "1" });

    await controller.getEvent(req as any, res as any, next);

    expect(serviceMock.getEventById).toHaveBeenCalledWith("1");
    expect(res.json).toHaveBeenCalledWith({ id: "1" });
  });

  test("getEvent - service throws -> calls next", async () => {
    const req = makeReq({}, { id: "n" });
    const res = makeRes();
    const err = new Error("no");
    (serviceMock.getEventById as jest.Mock).mockRejectedValue(err);

    await controller.getEvent(req as any, res as any, next);

    expect(next).toHaveBeenCalledWith(err);
  });

  test("listEvents - success", async () => {
    const req = makeReq({}, {}, { page: "2", pageSize: "5" });
    const res = makeRes();
    (serviceMock.listEvents as jest.Mock).mockResolvedValue([{ id: "1" }]);

    await controller.listEvents(req as any, res as any, next);

    expect(serviceMock.listEvents).toHaveBeenCalledWith(
      {},
      { page: 2, pageSize: 5 }
    );
    expect(res.json).toHaveBeenCalledWith([{ id: "1" }]);
  });

  test("updateEvent - success", async () => {
    const req = makeReq({ name: "updated" }, { id: "1" });
    const res = makeRes();
    (serviceMock.updateEvent as jest.Mock).mockResolvedValue({
      id: "1",
      name: "updated",
    });

    await controller.updateEvent(req as any, res as any, next);

    expect(serviceMock.updateEvent).toHaveBeenCalledWith("1", req.body);
    expect(res.json).toHaveBeenCalledWith({ id: "1", name: "updated" });
  });

  test("deleteEvent - success -> 204", async () => {
    const req = makeReq({}, { id: "1" });
    const res = makeRes();
    (serviceMock.deleteEvent as jest.Mock).mockResolvedValue(undefined);

    await controller.deleteEvent(req as any, res as any, next);

    expect(serviceMock.deleteEvent).toHaveBeenCalledWith("1");
    expect(res.status).toHaveBeenCalledWith(204);
  });
});
