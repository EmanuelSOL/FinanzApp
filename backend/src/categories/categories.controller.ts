import { Controller, Get, Param, Body, Post, Put, Delete, UseGuards, ValidationPipe, Request, ParseIntPipe } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthGuard } from '@nestjs/passport'; 

@UseGuards(AuthGuard('jwt'))
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Body(new ValidationPipe()) createCategoryDto: CreateCategoryDto, @Request() req) { // Añade @Request() req
    const userId = req.user.id; // Obtén userId del request
    return this.categoriesService.create(createCategoryDto, userId); // Pasa userId al servicio
  }

  @Get()
  findAllByUser(@Request() req) { // Cambiado para obtener solo las del usuario
    const userId = req.user.id;
    return this.categoriesService.findAllByUser(userId);
  }

  @Get(':id')
  findOneByUser(@Param('id', ParseIntPipe) id: number, @Request() req) { 
    const userId = req.user.id;
    return this.categoriesService.findOneByUser(id, userId);
  }

  @Put(':id') 
  updateByUser(@Param('id', ParseIntPipe) id: number, @Body(new ValidationPipe()) updateCategoryDto: UpdateCategoryDto, @Request() req) {
    const userId = req.user.id;
    return this.categoriesService.updateByUser(id, updateCategoryDto, userId);
  }

  @Delete(':id')
  removeByUser(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user.id;
    return this.categoriesService.removeByUser(id, userId);
  }
}


