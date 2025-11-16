// tests/unit/controllers/attendees.controller.spec.ts
import { jest } from "@jest/globals";
import { createAttendeesController } from "../../../src/controllers/attendees.controller.js";
import type { AttendeesService } from "../../../src/services/attendees.service.js";
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

describe("AttendeesController (unit)", () => {
  let serviceMock: any;
  let controller: ReturnType<typeof createAttendeesController>;
  let next: NextFunction;

  beforeEach(() => {
    serviceMock = {
      createAttendee: jest.fn(),
      listAttendees: jest.fn(),
      getAttendeeById: jest.fn(),
      updateStatus: jest.fn(),
      deleteAttendee: jest.fn(),
    };

    controller = createAttendeesController(serviceMock as any);
    next = jest.fn();
  });

  test("createAttendee - success", async () => {
    const req = makeReq({ name: "A", email: "a@b.com" });
    const res = makeRes();
    serviceMock.createAttendee.mockResolvedValue({ id: "1", name: "A" });

    await controller.createAttendee(req, res as any, next);
    expect(serviceMock.createAttendee).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: "1", name: "A" });
  });

  test("createAttendee - error -> next", async () => {
    const req = makeReq({ name: "A" });
    const res = makeRes();
    const err = new Error("boom");
    serviceMock.createAttendee.mockRejectedValue(err);

    await controller.createAttendee(req, res as any, next);
    expect(next).toHaveBeenCalledWith(err);
  });

  test("getAttendee - success", async () => {
    const req = makeReq({}, { id: "1" });
    const res = makeRes();
    serviceMock.getAttendeeById.mockResolvedValue({ id: "1" });

    await controller.getAttendee(req as any, res as any, next);
    expect(serviceMock.getAttendeeById).toHaveBeenCalledWith("1");
    expect(res.json).toHaveBeenCalledWith({ id: "1" });
  });

  test("listAttendees - success with pagination", async () => {
    const req = makeReq({}, {}, { page: "2", pageSize: "5" });
    const res = makeRes();
    serviceMock.listAttendees.mockResolvedValue([{ id: "1" }]);

    await controller.listAttendees(req as any, res as any, next);
    expect(serviceMock.listAttendees).toHaveBeenCalledWith(
      {},
      { page: 2, pageSize: 5 }
    );
    expect(res.json).toHaveBeenCalledWith([{ id: "1" }]);
  });

  test("patchStatus - success", async () => {
    const req = makeReq({ status: "confirmed" }, { id: "1" });
    const res = makeRes();
    serviceMock.updateStatus.mockResolvedValue({
      id: "1",
      status: "confirmed",
    });

    await controller.patchStatus(req as any, res as any, next);
    expect(serviceMock.updateStatus).toHaveBeenCalledWith("1", {
      status: "confirmed",
    });
    expect(res.json).toHaveBeenCalledWith({ id: "1", status: "confirmed" });
  });
});
