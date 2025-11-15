// tests/integration/events.int.spec.ts
import { jest } from "@jest/globals";
import { GenericContainer } from "testcontainers";
import { execSync } from "child_process";
import request from "supertest";

jest.setTimeout(120_000);

describe("Events API (integration with testcontainer)", () => {
  let container: any;
  let app: any;
  let prisma: any;

  beforeAll(async () => {
    // 1) Levantar Postgres efímero
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

    // 2) Apuntar Prisma a ese contenedor (runtime)
    process.env.DATABASE_URL = `postgresql://postgres:password@${host}:${port}/testdb?schema=public`;

    // 3) Aplicar schema al DB (más rápido y seguro que migraciones en CI)
    execSync("npx prisma db push --schema=./prisma/schema.prisma", {
      stdio: "inherit",
      env: process.env,
    });

    // 4) Importar app y prisma (desde src, usando .js specifiers — ts-jest mapeará .ts)
    //    NO hacemos prisma generate aquí; se ejecuta una sola vez desde package.json antes de los tests.
    const modApp = await import("../../src/app.js");
    app = modApp.default;

    const modPrisma = await import("../../src/prisma/client.js");
    prisma = modPrisma.prisma;

    // 5) ensure DB clean
    await prisma.event.deleteMany();
  });

  afterAll(async () => {
    if (prisma) await prisma.$disconnect();
    if (container) await container.stop();
  });

  test("POST /events -> create, GET /events/:id -> retrieve, list", async () => {
    const payload = {
      name: "Integration Event",
      date: "2026-02-01T12:00:00.000Z",
      location: "Conference Hall",
      type: "conference",
      description: "integration test",
    };

    const postRes = await request(app)
      .post("/events")
      .send(payload)
      .expect(201);
    expect(postRes.body).toHaveProperty("id");
    const id = postRes.body.id;

    const getRes = await request(app).get(`/events/${id}`).expect(200);
    expect(getRes.body).toMatchObject({
      id,
      name: payload.name,
      location: payload.location,
      type: payload.type,
    });

    const listRes = await request(app).get("/events").expect(200);
    expect(Array.isArray(listRes.body)).toBe(true);
  });

  test("PUT /events/:id and DELETE /events/:id", async () => {
    const p = {
      name: "To Update",
      date: "2026-03-01T10:00:00.000Z",
      location: "Loc",
      type: "fair",
    };
    const create = await request(app).post("/events").send(p).expect(201);
    const id = create.body.id;

    const update = await request(app)
      .put(`/events/${id}`)
      .send({ name: "Updated Name" })
      .expect(200);
    expect(update.body.name).toBe("Updated Name");

    await request(app).delete(`/events/${id}`).expect(204);

    // We expect controller to throw -> middleware returns 500 by default (as earlier)
    await request(app).get(`/events/${id}`).expect(500);
  });
});
