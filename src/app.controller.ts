import { Controller, Get, HttpCode } from '@nestjs/common';
import { Public } from './decorators/public.decorator';

@Controller()
export class AppController {
  @Public()
  @Get()
  root() {
    return {
      status: 'ok',
      service: 'Finova API',
      version: '1.0',
      endpoints: {
        health: '/api/v1/health',
        docs: '/api/docs',
        api: '/api/v1',
      },
    };
  }

  @Public()
  @Get('favicon.ico')
  @HttpCode(204)
  favicon() {
    return;
  }

  @Public()
  @Get('favicon.png')
  @HttpCode(204)
  faviconPng() {
    return;
  }
}
