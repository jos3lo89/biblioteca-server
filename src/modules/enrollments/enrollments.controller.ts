import { Body, Controller, Get, Post } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { Auth } from '@/common/decorators/auth.decorator';
import { UserRole } from '@/generated/prisma/enums';
import { CreatedDto } from './dto/created.dto';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentService: EnrollmentsService) {}

  @Post()
  @Auth(UserRole.ADMIN)
  created(@Body() body: CreatedDto) {
    return this.enrollmentService.created(body);
  }

  @Get()
  @Auth(UserRole.ADMIN)
  allEnrollments() {
    return this.enrollmentService.getAllEnrollments();
  }
}
