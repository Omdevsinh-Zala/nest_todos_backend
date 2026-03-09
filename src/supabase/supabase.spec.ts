import { Test, TestingModule } from '@nestjs/testing';
import { Supabase } from './supabase';

describe('Supabase', () => {
  let provider: Supabase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Supabase],
    }).compile();

    provider = module.get<Supabase>(Supabase);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
