import { jest } from "@jest/globals";
import { NotificationsService } from "../../../src/services/notifications.service.js";

describe("NotificationsService (unit)", () => {
  let repo: any;
  let svc: NotificationsService;

  const sample = {
    id: "n1",
    type: "EMAIL",
    message: "Hi",
    recipients: ["a@x.com"],
    sentAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    repo = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
    };
    svc = new NotificationsService(repo);
  });

  test("rejects invalid type", async () => {
    await expect(
      svc.sendNotification({
        type: "PUSH" as any,
        message: "x",
        recipients: ["a@x.com"],
      })
    ).rejects.toThrow("Invalid notification type");
  });

  test("rejects empty message or recipients", async () => {
    await expect(
      svc.sendNotification({
        type: "EMAIL",
        message: "",
        recipients: ["a@x.com"],
      })
    ).rejects.toThrow("Message is required");
    await expect(
      svc.sendNotification({ type: "SMS", message: "hi", recipients: [] })
    ).rejects.toThrow("Recipients required");
  });

  test("sends and marks sentAt", async () => {
    repo.create.mockResolvedValue(sample);
    const sentDate = new Date();
    repo.update.mockResolvedValue({ ...sample, sentAt: sentDate });

    const res = await svc.sendNotification({
      type: "EMAIL",
      message: "hello",
      recipients: ["a@x.com"],
    });
    expect(repo.create).toHaveBeenCalled();
    expect(repo.update).toHaveBeenCalledWith(
      sample.id,
      expect.objectContaining({ sentAt: expect.any(Date) })
    );
    expect(res.sentAt).toEqual(sentDate);
  });

  test("get/list/update/delete forwarding", async () => {
    repo.findById.mockResolvedValue(sample);
    repo.findAll.mockResolvedValue([sample]);
    repo.update.mockResolvedValue({ ...sample, message: "x" });
    repo.delete.mockResolvedValue(undefined);

    expect(await svc.getNotificationById("n1")).toEqual(sample);
    expect(await svc.listNotifications({}, { page: 1, pageSize: 10 })).toEqual([
      sample,
    ]);
    expect(await svc.updateNotification("n1", { message: "x" })).toEqual(
      expect.objectContaining({ message: "x" })
    );
    await expect(svc.deleteNotification("n1")).resolves.toBeUndefined();
  });

  test("getNotificationById throws when not found", async () => {
    repo.findById.mockResolvedValue(null);
    await expect(svc.getNotificationById("no")).rejects.toThrow(
      "Notification not found"
    );
  });
});
