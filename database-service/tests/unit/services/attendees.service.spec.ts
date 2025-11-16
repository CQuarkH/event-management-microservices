// tests/unit/services/attendees.service.spec.ts
import { jest } from "@jest/globals";
import { AttendeesService } from "../../../src/services/attendees.service.js";
import type { IAttendeesRepository } from "../../../src/repositories/interfaces/i-attendees.repository.js";

describe("AttendeesService (unit)", () => {
  let repoMock: jest.Mocked<IAttendeesRepository>;
  let service: AttendeesService;

  const sample = {
    id: "att-1",
    name: "Alice",
    email: "alice@example.com",
    phone: null,
    status: "unconfirmed" as const,
    eventId: null,
    createdAt: new Date(),
  };

  beforeEach(() => {
    repoMock = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      updateStatus: jest.fn(),
      delete: jest.fn(),
    };

    service = new AttendeesService(repoMock);
  });

  test("createAttendee - success", async () => {
    const payload = { name: "Alice", email: "alice@example.com" };
    repoMock.create.mockResolvedValue(sample as any);

    const res = await service.createAttendee(payload as any);
    expect(repoMock.create).toHaveBeenCalledWith({
      name: payload.name,
      email: payload.email,
      phone: null,
      status: "unconfirmed",
      eventId: null,
    });
    expect(res).toEqual(sample);
  });

  test("createAttendee - invalid email throws", async () => {
    await expect(
      service.createAttendee({ name: "X", email: "bad-email" } as any)
    ).rejects.toThrow("Invalid email");
  });

  test("getAttendeeById - found", async () => {
    repoMock.findById.mockResolvedValue(sample as any);
    const res = await service.getAttendeeById("att-1");
    expect(repoMock.findById).toHaveBeenCalledWith("att-1");
    expect(res).toEqual(sample);
  });

  test("getAttendeeById - not found throws", async () => {
    repoMock.findById.mockResolvedValue(null);
    await expect(service.getAttendeeById("nope")).rejects.toThrow(
      "Attendee not found"
    );
  });

  test("listAttendees - calls repo findAll", async () => {
    repoMock.findAll.mockResolvedValue([sample as any]);
    const res = await service.listAttendees({}, { page: 1, pageSize: 10 });
    expect(repoMock.findAll).toHaveBeenCalledWith(
      {},
      { page: 1, pageSize: 10 }
    );
    expect(res).toEqual([sample]);
  });

  test("updateStatus - success", async () => {
    const updated = { ...sample, status: "confirmed" as const };
    repoMock.updateStatus.mockResolvedValue(updated as any);
    const res = await service.updateStatus("att-1", { status: "confirmed" });
    expect(repoMock.updateStatus).toHaveBeenCalledWith("att-1", {
      status: "confirmed",
    });
    expect(res).toEqual(updated);
  });

  test("updateStatus - invalid status throws", async () => {
    // @ts-ignore
    await expect(
      service.updateStatus("att-1", { status: "bad" })
    ).rejects.toThrow("Invalid status");
  });

  test("deleteAttendee - calls repo.delete", async () => {
    repoMock.delete.mockResolvedValue(undefined);
    await service.deleteAttendee("att-1");
    expect(repoMock.delete).toHaveBeenCalledWith("att-1");
  });
});
