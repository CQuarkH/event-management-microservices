import app from "./app.js";
import dotenv from "dotenv";
import { prisma } from "./prisma/client.js"

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

async function start() {
  try {
    // intentamos conectar Prisma (verifica DB)
    await prisma.$connect();
    console.log("Connected to DB via Prisma");
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
      console.log(`Swagger docs available at http://localhost:${PORT}/docs`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

start();
