import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SupabaseService } from '../../supabase/supabase';

@Injectable()
export class TokenCleanupService {
  private readonly logger = new Logger(TokenCleanupService.name);

  constructor(private readonly supabase: SupabaseService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.debug('Running daily verification token cleanup');

    const now = new Date().toISOString();

    // Delete tokens that are either explicitly verified,
    // or pending but past their expiration time
    const { data, error } = await this.supabase
      .getAnon()
      .from('verification_tokens')
      .delete()
      .or(`status.eq.verified,and(status.eq.pending,expires_at.lt.${now})`);

    if (error) {
      this.logger.error(
        'Failed to cleanup verification tokens:',
        error.message,
      );
    } else {
      this.logger.debug(
        `Successfully cleaned up expired/used verification tokens.`,
      );
    }
  }
}
