import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { randomUUID } from 'crypto';
import 'dotenv/config';

const prisma = new PrismaClient();

function generateUniqueDatabaseUrl(schemaId: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error('Não localizado variavel de ambiente DATABASE_URL');
  }
  const url = new URL(process.env.DATABASE_URL);

  url.searchParams.set('schema', schemaId);
  return url.toString();
}

const schemaId = randomUUID();

beforeAll(async () => {
  const databaseUrl = generateUniqueDatabaseUrl(schemaId);
  process.env.DATABASE_URL = databaseUrl;
  execSync(`npx prisma migrate deploy`);
});

afterAll(async () => {
  try {
    await prisma.$executeRawUnsafe(
      `DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`,
    );
  } catch (error) {
    console.error('Erro ao dropar o schema:', error);
  } finally {
    await prisma.$disconnect();
  }
});
