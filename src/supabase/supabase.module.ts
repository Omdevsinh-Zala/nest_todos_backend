import { DynamicModule, Module, Global } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import {
  SUPABASE_OPTIONS,
  type SupabaseModuleOptions,
  type SupabaseModuleAsyncOptions,
} from './supabase.constant';

@Global()
@Module({})
export class SupabaseModule {
  static forRoot(options: SupabaseModuleOptions): DynamicModule {
    return {
      module: SupabaseModule,
      providers: [
        {
          provide: SUPABASE_OPTIONS,
          useValue: options,
        },
        SupabaseService,
      ],
      exports: [SupabaseService],
    };
  }

  static forRootAsync(options: SupabaseModuleAsyncOptions): DynamicModule {
    return {
      module: SupabaseModule,
      imports: options.imports || [],
      providers: [
        {
          provide: SUPABASE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        SupabaseService,
      ],
      exports: [SupabaseService],
    };
  }
}
