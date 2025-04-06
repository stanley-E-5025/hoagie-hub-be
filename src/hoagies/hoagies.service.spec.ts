import { Test, TestingModule } from '@nestjs/testing';
import { HoagiesService } from './hoagies.service';

describe('HoagiesService', () => {
  let service: HoagiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HoagiesService],
    }).compile();

    service = module.get<HoagiesService>(HoagiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
