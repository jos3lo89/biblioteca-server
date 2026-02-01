import {
  BadRequestException,
  Controller,
  DefaultValuePipe,
  Get,
  HttpStatus,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Auth } from '@/common/decorators/auth.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { type CurrentUserI } from '@/common/interfaces/current-user.interface';
import { UserRole } from '@/generated/prisma/enums';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('profile')
  @Auth()
  myProfile(@CurrentUser() user: CurrentUserI) {
    return this.userService.myProfile(user.id);
  }

  @Get('students')
  @Auth(UserRole.ADMIN)
  getAllStudents(
    @Query(
      'page',
      new DefaultValuePipe(1),
      new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        exceptionFactory() {
          return new BadRequestException('Formato de pagina incorrecta');
        },
      }),
    )
    page: number,
    @Query(
      'limit',
      new DefaultValuePipe(5),
      new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        exceptionFactory() {
          return new BadRequestException('Formato de limite incorrecta');
        },
      }),
    )
    limit: number,
  ) {
    return this.userService.getAllStudents(page, limit);
  }
}
