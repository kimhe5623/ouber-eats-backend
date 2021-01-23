import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';
import { RestaurantService } from './restaurant.service';
import { CategoryResolver, RestaurantResolver } from './restaurants.resolver';

@Module({
    imports: [TypeOrmModule.forFeature([
        Restaurant,
        CategoryRepository,
    ])],
    providers: [RestaurantResolver, CategoryResolver, RestaurantService]
})
export class RestaurantsModule {}
