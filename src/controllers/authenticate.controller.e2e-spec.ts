import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { hash } from 'bcryptjs';
import { access } from 'fs';
import request from 'supertest';

describe('Authenticate account (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  test('[POST] /sessions', async () => {
    await prisma.user.create({
      data: {
        nome: 'John Doe',
        email: 'johndoe@example.com',
        senha: await hash('123456', 8),
      },
    });
    const response = await request(app.getHttpServer()).post('/sessions').send({
      email: 'johndoe@example.com',
      senha: '123456',
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      access_token: expect.any(String),
    });
  });
});
