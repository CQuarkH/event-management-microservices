// tests/integration/attendees.int.spec.ts
import { jest } from "@jest/globals";
import { GenericContainer } from "testcontainers";
import { execSync } from "child_process";
import request from "supertest";

jest.setTimeout(120_000);

describe("Attendees API (integration)", () => {
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

    execSync("npx prisma db push --schema=./prisma/schema.prisma", {
      stdio: "inherit",
      env: process.env,
    });

    const modApp = await import("../../src/app.js");
    app = modApp.default;

    const modPrisma = await import("../../src/prisma/client.js");
    prisma = modPrisma.prisma;

    // ensure clean
    await prisma.attendee.deleteMany();
  });

  afterAll(async () => {
    if (prisma) await prisma.$disconnect();
    if (container) await container.stop();
  });

  test("POST /attendees, GET /attendees/:id, GET /attendees", async () => {
    const payload = { name: "Bob", email: "bob@example.com" };

    const post = await request(app)
      .post("/attendees")
      .send(payload)
      .expect(201);
    expect(post.body).toHaveProperty("id");
    const id = post.body.id;

    const get = await request(app).get(`/attendees/${id}`).expect(200);
    expect(get.body).toMatchObject({
      id,
      name: payload.name,
      email: payload.email,
    });

    const list = await request(app).get("/attendees").expect(200);
    expect(Array.isArray(list.body)).toBe(true);
  });

  test("PATCH /attendees/:id/status and invalid updates", async () => {
    const payload = { name: "C", email: "c@example.com" };
    const post = await request(app)
      .post("/attendees")
      .send(payload)
      .expect(201);
    const id = post.body.id;

    const patched = await request(app)
      .patch(`/attendees/${id}/status`)
      .send({ status: "confirmed" })
      .expect(200);
    expect(patched.body.status).toBe("confirmed");

    // invalid status -> expect error via middleware -> 500
    await request(app)
      .patch(`/attendees/${id}/status`)
      .send({ status: "bad" })
      .expect(500);
  });
});
