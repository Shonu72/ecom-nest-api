import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: {
    getStatus: jest.Mock;
    getUsers: jest.Mock;
    createUser: jest.Mock;
    updateUser: jest.Mock;
  };

  beforeEach(async () => {
    appService = {
      getStatus: jest.fn().mockResolvedValue({
        service: 'ecom-nest-api',
        database: 'connected',
      }),
      getUsers: jest.fn().mockResolvedValue([]),
      createUser: jest.fn(),
      updateUser: jest.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: appService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return service status', async () => {
      await expect(appController.getStatus()).resolves.toEqual({
        service: 'ecom-nest-api',
        database: 'connected',
      });
    });
  });
});
