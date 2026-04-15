import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
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
  createUser(@Body() body: { email?: string; name?: string | null }) {
    return this.appService.createUser(body);
  }

  @Patch('users/:id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { email?: string; name?: string | null },
  ) {
    return this.appService.updateUser(id, body);
  }
}
