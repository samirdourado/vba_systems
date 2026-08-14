import { Test, TestingModule } from '@nestjs/testing';
import { LeraBoxService } from './lera-box.service';

describe('LeraBoxService', () => {
  let service: LeraBoxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeraBoxService],
    }).compile();

    service = module.get<LeraBoxService>(LeraBoxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
