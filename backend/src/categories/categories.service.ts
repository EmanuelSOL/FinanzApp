import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'; 
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../entities/category.entity';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
   constructor(
     @InjectRepository(Category)
     private categoriesRepository: Repository<Category>,
     @InjectRepository(User)
     private usersRepository: Repository<User>,
   ) {}

   async create(createCategoryDto: CreateCategoryDto, userId: number): Promise<Category> {
     const user = await this.usersRepository.findOneBy({ id: userId });
     if (!user) {
       throw new NotFoundException(`Usuario con ID ${userId} no encontrado.`);
     }

     const existingCategory = await this.categoriesRepository.findOne({
       where: { name: createCategoryDto.name, user: { id: userId } },
     });

     if (existingCategory) {
       throw new ConflictException(
         `La categoría "${createCategoryDto.name}" ya existe para este usuario.`,
       );
     }
     
     const newCategory = this.categoriesRepository.create({
       ...createCategoryDto,
       user: user,
     });
     return this.categoriesRepository.save(newCategory);
   }

   async findAllByUser(userId: number): Promise<Category[]> {
     return this.categoriesRepository.find({
       where: { user: { id: userId } },
       order: { name: 'ASC' }, 
     });
   }

   async findOneByUser(id: number, userId: number): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!category) {
      throw new NotFoundException(
        `Categoría con ID ${id} no encontrada o no pertenece al usuario.`,
      );
    }
    return category;
  }

  async updateByUser(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
    userId: number,
  ): Promise<Category> {
    const categoryToUpdate = await this.findOneByUser(id, userId);

    if (updateCategoryDto.name && updateCategoryDto.name !== categoryToUpdate.name) {
        const existingCategoryWithName = await this.categoriesRepository.findOne({
            where: { name: updateCategoryDto.name, user: { id: userId } },
        });
        if (existingCategoryWithName && existingCategoryWithName.id !== id) {
            throw new ConflictException(
               `Ya existe otra categoría con el nombre "${updateCategoryDto.name}" para este usuario.`,
            );
        }
    }
    
    await this.categoriesRepository.update({ id, user: { id: userId } }, updateCategoryDto);
    return this.findOneByUser(id, userId);
  }

  async removeByUser(id: number, userId: number): Promise<void> {
    const result = await this.categoriesRepository.delete({ id, user: { id: userId } });
    if (result.affected === 0) {
      throw new NotFoundException(
        `Categoría con ID ${id} no encontrada o no pertenece al usuario.`,
      );
    }
  }
}


