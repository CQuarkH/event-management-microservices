import { jest } from "@jest/globals";
import { GenericContainer } from "testcontainers";
import { execSync } from "child_process";
import request from "supertest";

jest.setTimeout(120_000);

describe("Tickets API (integration)", () => {
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

    // import app & prisma (source imports with .js specifiers)
    const modApp = await import("../../src/app.js");
    app = modApp.default;

    const modPrisma = await import("../../src/prisma/client.js");
    prisma = modPrisma.prisma;

    // create an event and a ticket to operate on
    await prisma.event.deleteMany();
    await prisma.ticket.deleteMany();

    const ev = await prisma.event.create({
      data: {
        name: "Tix Event",
        date: new Date("2026-01-01T10:00:00.000Z"),
        location: "Hall",
        type: "concert",
        description: "for tickets",
      },
    });

    // usa el enum en mayúsculas que Prisma espera
    await prisma.ticket.create({
      data: {
        eventId: ev.id,
        type: "GENERAL",
        price: 20,
        quantityAvailable: 3,
        quantitySold: 0,
      },
    });
  });

  afterAll(async () => {
    if (prisma) await prisma.$disconnect();
    if (container) await container.stop();
  });

  test("GET /tickets -> should list and GET availability", async () => {
    const listRes = await request(app).get("/tickets").expect(200);
    expect(Array.isArray(listRes.body)).toBe(true);

    // find event id by fetching events (simple approach)
    const events = await request(app).get("/events").expect(200);
    expect(Array.isArray(events.body)).toBe(true);
    const ev = events.body.find((e: any) => e.name === "Tix Event");
    expect(ev).toBeTruthy();

    const avail = await request(app)
      .get(`/tickets/availability?eventId=${ev.id}&type=GENERAL`)
      .expect(200);
    expect(avail.body.available).toBe(true);
    expect(avail.body.quantityAvailable).toBeGreaterThan(0);
  });

  test("POST /tickets/purchase -> decrement inventory", async () => {
    // get ticket
    const tList = await request(app).get("/tickets").expect(200);
    const ticket = tList.body.find((t: any) => t.type === "GENERAL");
    expect(ticket).toBeTruthy();

    const post = await request(app)
      .post("/tickets/purchase")
      .send({ ticketId: ticket.id, quantity: 2 })
      .expect(201);
    expect(post.body.status).toBe("purchased");
    // check DB
    const check = await prisma.ticket.findUnique({ where: { id: ticket.id } });
    expect(check!.quantityAvailable).toBe(ticket.quantityAvailable - 2);
    expect(check!.quantitySold).toBe(ticket.quantitySold + 2);
  });

  test("concurrency: two purchases attempt on limited stock", async () => {
    // create a ticket with 1 available
    const ev = (await request(app).get("/events").expect(200)).body[0];
    const t = await prisma.ticket.create({
      data: {
        eventId: ev.id,
        type: "VIP",
        price: 50,
        quantityAvailable: 1,
        quantitySold: 0,
      },
    });

    // fire two parallel purchases of 1 unit
    const p1 = request(app)
      .post("/tickets/purchase")
      .send({ ticketId: t.id, quantity: 1 });
    const p2 = request(app)
      .post("/tickets/purchase")
      .send({ ticketId: t.id, quantity: 1 });

    const results = await Promise.allSettled([p1, p2]);
    const successCount = results.filter(
      (r: any) => r.status === "fulfilled" && r.value.status === 201
    ).length;

    // exactly one success expected (no oversell)
    expect(successCount).toBe(1);
  });
});
