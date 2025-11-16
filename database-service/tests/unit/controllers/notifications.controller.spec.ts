import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";

describe("Notifications Controller (unit)", () => {
  let app;
  let svc;

  beforeEach(() => {
    svc = {
      sendNotification: jest.fn(),
      listNotifications: jest.fn(),
      getNotificationById: jest.fn(),
      updateNotification: jest.fn(),
      deleteNotification: jest.fn(),
    };

    app = express();
    app.use(express.json());

    app.post("/notifications", async (req, res) => {
      try {
        const created = await svc.sendNotification(req.body);
        res.status(201).json(created);
      } catch (err) {
        res.status(500).json({ error: String(err) });
      }
    });

    app.get("/notifications", async (req, res) => {
      const page = req.query.page ? Number(req.query.page) : 1;
      const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 100;
      const items = await svc.listNotifications({}, { page, pageSize });
      res.json(items);
    });

    app.get("/notifications/:id", async (req, res) => {
      const n = await svc.getNotificationById(req.params.id);
      res.json(n);
    });

    app.put("/notifications/:id", async (req, res) => {
      const updated = await svc.updateNotification(req.params.id, req.body);
      res.json(updated);
    });

    app.delete("/notifications/:id", async (req, res) => {
      await svc.deleteNotification(req.params.id);
      res.status(204).send();
    });
  });

  test("POST success and failure", async () => {
    svc.sendNotification.mockResolvedValue({ id: "n1" });
    await request(app)
      .post("/notifications")
      .send({ type: "EMAIL", message: "x", recipients: ["a@x.com"] })
      .expect(201);

    svc.sendNotification.mockRejectedValue(new Error("boom"));
    const res = await request(app)
      .post("/notifications")
      .send({ type: "EMAIL", message: "x", recipients: ["a@x.com"] });
    expect(res.status).toBe(500);
  });

  test("list/get/update/delete flows", async () => {
    svc.listNotifications.mockResolvedValue([]);
    svc.getNotificationById.mockResolvedValue({ id: "n1" });
    svc.updateNotification.mockResolvedValue({ id: "n1", message: "x" });
    svc.deleteNotification.mockResolvedValue(undefined);

    await request(app).get("/notifications").expect(200);
    await request(app).get("/notifications/n1").expect(200);
    await request(app)
      .put("/notifications/n1")
      .send({ message: "x" })
      .expect(200);
    await request(app).delete("/notifications/n1").expect(204);
  });
});
