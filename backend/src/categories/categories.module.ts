import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../entities/category.entity';
import { User } from '../entities/user.entity'; 

@Module({
   imports: [
     TypeOrmModule.forFeature([
       Category, 
       User 
     ])
   ],
   controllers: [CategoriesController],
   providers: [CategoriesService],
})
export class CategoriesModule {}