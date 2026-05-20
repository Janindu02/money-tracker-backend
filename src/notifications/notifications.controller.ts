import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { JwtPayload } from '../types/auth.types';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Query() query: PaginationDto) {
    return this.notificationsService.findAll(user.sub, query);
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUser() user: JwtPayload) {
    return this.notificationsService.getUnreadCount(user.sub);
  }

  @Patch('read-all')
  markAllAsRead(@CurrentUser() user: JwtPayload) {
    return this.notificationsService.markAllAsRead(user.sub);
  }

  @Patch(':id/read')
  markAsRead(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.notificationsService.markAsRead(user.sub, id);
  }
}
