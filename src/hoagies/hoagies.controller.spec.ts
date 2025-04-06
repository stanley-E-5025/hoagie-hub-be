import { Test, TestingModule } from '@nestjs/testing';
import { HoagiesController } from './hoagies.controller';

describe('HoagiesController', () => {
  let controller: HoagiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HoagiesController],
    }).compile();

    controller = module.get<HoagiesController>(HoagiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
