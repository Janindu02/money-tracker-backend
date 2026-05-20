import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AiInsightsService } from './ai-insights.service';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { JwtPayload } from '../types/auth.types';

@ApiTags('ai-insights')
@ApiBearerAuth()
@Controller('ai-insights')
export class AiInsightsController {
  constructor(private aiInsightsService: AiInsightsService) {}

  @Get()
  @ApiOperation({ summary: 'Get AI financial insights' })
  getInsights(@CurrentUser() user: JwtPayload) {
    return this.aiInsightsService.getInsights(user.sub);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Regenerate AI insights' })
  generate(@CurrentUser() user: JwtPayload) {
    return this.aiInsightsService.generateInsights(user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Dismiss an insight' })
  dismiss(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.aiInsightsService.dismiss(user.sub, id);
  }
}
