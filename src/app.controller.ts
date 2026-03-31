import { Controller, Get, HttpCode } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  getSystemStatus() {
    return this.appService.getSystemStatus();
  }

  @Get('/favicon.ico')
  @HttpCode(204)
  getFavicon() {
    return '';
  }

  // @Get('/debug-sentry')
  // getError() {
  //   throw new Error('My first Sentry error!');
  // }
}
