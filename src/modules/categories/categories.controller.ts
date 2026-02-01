import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreatedDto } from './dto/created.dto';
import { CategoriesService } from './categories.service';
import { Auth } from '@/common/decorators/auth.decorator';
import { UserRole } from '@/generated/prisma/enums';
import { FindCategoryQueryDto } from './dto/find-category-query.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categorieService: CategoriesService) {}

  @Post()
  @Auth(UserRole.ADMIN)
  created(@Body() body: CreatedDto) {
    return this.categorieService.created(body);
  }

  @Get()
  @Auth()
  getCategories(@Query() query: FindCategoryQueryDto) {
    return this.categorieService.getCategories(query);
  }

  @Get('all')
  @Auth()
  getAllCategories() {
    return this.categorieService.getAllCategories();
  }
}
