import { jest } from "@jest/globals";
import { GenericContainer } from "testcontainers";
import { execSync } from "child_process";
import request from "supertest";

jest.setTimeout(120_000);

describe("Notifications API (integration)", () => {
  let container: any;
  let app: any;
  let prisma: any;

  beforeAll(async () => {
    container = await new GenericContainer("postgres:15")
      .withEnvironment({
        POSTGRES_USER: "postgres",
        POSTGRES_PASSWORD: "password",
        POSTGRES_DB: "testdb",
      })
      .withExposedPorts(5432)
      .start();

    const host = container.getHost();
    const port = container.getMappedPort(5432);
    process.env.DATABASE_URL = `postgresql://postgres:password@${host}:${port}/testdb?schema=public`;
    process.env.PRISMA_FORCE_NAPI = "true";

    execSync("npx prisma db push --schema=./prisma/schema.prisma", {
      stdio: "inherit",
      env: process.env,
    });

    const modApp = await import("../../src/app.js");
    app = modApp.default;
    const client = await import("../../src/prisma/client.js");
    prisma = client.prisma;

    await prisma.notification.deleteMany();
  });

  afterAll(async () => {
    if (prisma) await prisma.$disconnect();
    if (container) await container.stop();
  });

  test("full lifecycle", async () => {
    const sent = await request(app)
      .post("/notifications")
      .send({ type: "EMAIL", message: "Integration", recipients: ["a@x.com"] })
      .expect(201);
    expect(sent.body).toHaveProperty("id");
    expect(sent.body.sentAt).not.toBeNull();
    const id = sent.body.id;

    const list = await request(app).get("/notifications").expect(200);
    expect(Array.isArray(list.body)).toBe(true);

    await request(app).get(`/notifications/${id}`).expect(200);
    await request(app)
      .put(`/notifications/${id}`)
      .send({ message: "updated" })
      .expect(200);
    await request(app).delete(`/notifications/${id}`).expect(204);
  });
});
