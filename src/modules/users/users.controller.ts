import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { Auth } from '@/common/decorators/auth.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { type CurrentUserI } from '@/common/interfaces/current-user.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('profile')
  @Auth()
  myProfile(@CurrentUser() user: CurrentUserI) {
    return this.userService.myProfile(user.id);
  }
}
