// tests/unit/services/events.service.spec.ts
import { jest } from "@jest/globals";
import { EventsService } from "../../../src/services/events.service.js";
import type { IEventsRepository } from "../../../src/repositories/interfaces/i-events.repository.js";

describe("EventsService (unit)", () => {
  let repoMock: jest.Mocked<IEventsRepository>;
  let service: EventsService;

  const sampleEvent = {
    id: "event-1",
    name: "Test Event",
    date: new Date("2026-01-01T10:00:00.000Z"),
    location: "Stadium",
    type: "concert",
    description: "sample",
  };

  beforeEach(() => {
    repoMock = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    service = new EventsService(repoMock);
  });

  test("createEvent - should call repository.create and return created event", async () => {
    const payload = {
      name: "Test Event",
      date: "2026-01-01T10:00:00.000Z",
      location: "Stadium",
      type: "concert",
      description: "sample",
    };
    const created = { ...sampleEvent };

    repoMock.create.mockResolvedValue(created as any);

    const res = await service.createEvent(payload);

    expect(repoMock.create).toHaveBeenCalledTimes(1);
    expect(repoMock.create).toHaveBeenCalledWith({
      name: payload.name,
      date: new Date(payload.date),
      location: payload.location,
      type: payload.type,
      description: payload.description ?? null,
    });
    expect(res).toEqual(created);
  });

  test("createEvent - invalid date throws", async () => {
    const payload = {
      name: "Bad Date",
      date: "not-a-date",
      location: "Nowhere",
      type: "conference",
    };

    await expect(service.createEvent(payload as any)).rejects.toThrow(
      "Invalid date"
    );
  });

  test("getEventById - returns event when found", async () => {
    repoMock.findById.mockResolvedValue(sampleEvent as any);

    const res = await service.getEventById("event-1");

    expect(repoMock.findById).toHaveBeenCalledWith("event-1");
    expect(res).toEqual(sampleEvent);
  });

  test("getEventById - throws when not found", async () => {
    repoMock.findById.mockResolvedValue(null);

    await expect(service.getEventById("nope")).rejects.toThrow(
      "Event not found"
    );
  });

  test("updateEvent - calls update and returns updated", async () => {
    const updateDto = { name: "Updated name", description: "new" };
    const updated = { ...sampleEvent, ...updateDto };
    repoMock.update.mockResolvedValue(updated as any);

    const res = await service.updateEvent("event-1", updateDto as any);

    expect(repoMock.update).toHaveBeenCalledWith("event-1", {
      name: updateDto.name,
      description: updateDto.description,
    });
    expect(res).toEqual(updated);
  });

  test("updateEvent - invalid date throws", async () => {
    await expect(
      service.updateEvent("event-1", { date: "not-a-date" } as any)
    ).rejects.toThrow("Invalid date");
  });

  test("deleteEvent - calls repository.delete", async () => {
    repoMock.delete.mockResolvedValue(undefined);

    await service.deleteEvent("event-1");

    expect(repoMock.delete).toHaveBeenCalledWith("event-1");
  });

  test("listEvents - forwards filter and pagination to repository", async () => {
    const items = [sampleEvent];
    repoMock.findAll.mockResolvedValue(items as any);

    const res = await service.listEvents({}, { page: 1, pageSize: 10 });

    expect(repoMock.findAll).toHaveBeenCalledWith(
      {},
      { page: 1, pageSize: 10 }
    );
    expect(res).toEqual(items);
  });
});
