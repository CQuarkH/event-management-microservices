// src/prisma/client.ts
import 'dotenv/config'; // asegurar que .env esté cargado si prisma generate lo usa
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
