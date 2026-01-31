import { Body, Controller, Post } from '@nestjs/common';
import { CreatedDto } from './dto/created.dto';
import { CategoriesService } from './categories.service';
import { Auth } from '@/common/decorators/auth.decorator';
import { UserRole } from '@/generated/prisma/enums';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categorieService: CategoriesService) {}

  @Post()
  @Auth(UserRole.ADMIN)
  created(@Body() body: CreatedDto) {
    return this.categorieService.created(body);
  }
}
