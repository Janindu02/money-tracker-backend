import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { JwtPayload } from '../types/auth.types';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { NotificationPrefsDto } from './dto/notification-prefs.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.usersService.getProfile(user.sub);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile' })
  updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.sub, dto);
  }

  @Patch('notification-preferences')
  @ApiOperation({ summary: 'Update notification preferences' })
  updateNotificationPrefs(
    @CurrentUser() user: JwtPayload,
    @Body() dto: NotificationPrefsDto,
  ) {
    return this.usersService.updateNotificationPrefs(user.sub, dto);
  }
}
