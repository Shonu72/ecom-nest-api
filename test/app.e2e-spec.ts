import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const prismaMock = {
    $queryRaw: jest.fn().mockResolvedValue([{ result: 1 }]),
    user: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 1,
          email: 'alice@example.com',
          name: 'Alice',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        },
      ]),
      create: jest.fn().mockImplementation(({ data }) =>
        Promise.resolve({
          id: 2,
          email: data.email,
          name: data.name ?? null,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
      ),
      update: jest.fn().mockImplementation(({ where, data }) =>
        Promise.resolve({
          id: where.id,
          email: data.email ?? 'alice@example.com',
          name: data.name ?? 'Alice',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-02T00:00:00.000Z'),
        }),
      ),
    },
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpAdapter().getInstance())
      .get('/')
      .expect(200)
      .expect({
        service: 'ecom-nest-api',
        database: 'connected',
      });
  });

  it('/users (GET)', () => {
    return request(app.getHttpAdapter().getInstance())
      .get('/users')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toHaveLength(1);
        expect(body[0]).toMatchObject({
          id: 1,
          email: 'alice@example.com',
          name: 'Alice',
        });
      });
  });

  it('/users (POST)', () => {
    return request(app.getHttpAdapter().getInstance())
      .post('/users')
      .send({
        email: 'new@example.com',
        name: 'New User',
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          id: 2,
          email: 'new@example.com',
          name: 'New User',
        });
      });
  });

  it('/users/:id (PATCH)', () => {
    return request(app.getHttpAdapter().getInstance())
      .patch('/users/1')
      .send({
        name: 'Alice Updated',
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          id: 1,
          email: 'alice@example.com',
          name: 'Alice Updated',
        });
      });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });
});
