import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

/**
 * AppController handles global server routes like health checks.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Returns the server and database status.
   */
  @Public()
  @Get()
  getStatus() {
    return this.appService.getStatus();
  }

  /**
   * Explicit health check endpoint.
   */
  @Public()
  @Get('health')
  getHealth() {
    return this.appService.getStatus();
  }
}
