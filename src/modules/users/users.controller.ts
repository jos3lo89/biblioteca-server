import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Auth } from '@/common/decorators/auth.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { type CurrentUserI } from '@/common/interfaces/current-user.interface';
import { UserRole } from '@/generated/prisma/enums';
import { StudentRegisterDto } from './dto/student-register.dto';
import { FindUsersQueryDto } from './dto/find-users-query.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('profile')
  @Auth()
  myProfile(@CurrentUser() user: CurrentUserI) {
    return this.userService.myProfile(user.id);
  }

  @Get(':role/with-role')
  @Auth(UserRole.ADMIN)
  getUsersWithRole(
    @Param('role') role: UserRole,
    @Query() query: FindUsersQueryDto,
  ) {
    return this.userService.getUsersWithRole(role, query);
  }

  @Post('students/register')
  @Auth(UserRole.ADMIN)
  registerStudent(@Body() body: StudentRegisterDto) {
    return this.userService.registerStudent(body);
  }
}
