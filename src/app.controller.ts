import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getStatus() {
    return this.appService.getStatus();
  }

  @Get('users')
  getUsers() {
    return this.appService.getUsers();
  }

  @Post('users')
  createUser(@Body() body: { email: string; password: string; firstName?: string | null; lastName?: string | null }) {
    return this.appService.createUser(body);
  }

  @Patch('users/:id')
  updateUser(
    @Param('id') id: string,
    @Body() body: { email?: string; firstName?: string | null; lastName?: string | null },
  ) {
    return this.appService.updateUser(id, body);
  }
}
