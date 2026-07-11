import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('health', () => {
    it('should return a health check response', () => {
      const response = appController.getHealth();

      expect(response).toMatchObject({
        status: 'ok',
        service: 'teamboard-api',
      });
      expect(new Date(response.timestamp).toString()).not.toBe('Invalid Date');
    });
  });
});
