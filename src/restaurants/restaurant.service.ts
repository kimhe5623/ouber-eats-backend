import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateAccountOutput } from "src/users/dtos/create-account.dto";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { AllCategoriesOutput } from "./dtos/all-categories.dto";
import { CategoryInput, CategoryOutput } from "./dtos/category.dto";
import { CreateRestaurantInput } from "./dtos/create-restaurant.dto";
import { DeleteRestaurantInput, DeleteRestaurantOutput } from "./dtos/delete-restaurant.dto";
import { EditRestaurantInput, EditRestaurantOutput } from "./dtos/edit-restaurant.dto";
import { Category } from "./entities/category.entity";
import { Restaurant } from "./entities/restaurant.entity";
import { CategoryRepository } from "./repositories/category.repository"

@Injectable()
export class RestaurantService {
    constructor(
        @InjectRepository(Restaurant)
        private readonly restaurants: Repository<Restaurant>,
        @InjectRepository(Category)
        private readonly categories: CategoryRepository
    ) { }

    async createRestaruant(
        owner: User,
        createRestaurantInput: CreateRestaurantInput)
        : Promise<CreateAccountOutput> {
        try {
            const newRestaurant = await this.restaurants.create(createRestaurantInput);
            newRestaurant.owner = owner;
            newRestaurant.category = await this.categories.getOrCreate(createRestaurantInput.categoryName);

            await this.restaurants.save(newRestaurant);
            return {
                ok: true,
            }
        } catch {
            return {
                ok: false,
                error: 'Could not create restaurant'
            }
        }
    }

    async editRestaurant(
        owner: User, editRestaurantInput: EditRestaurantInput
    ): Promise<EditRestaurantOutput> {
        try {
            const restaurant = await this.restaurants.findOne(
                editRestaurantInput.restaurantId
            );
            if (!restaurant) {
                return {
                    ok: false,
                    error: "Restaurant not found"
                };
            }
            if (owner.id !== restaurant.ownerId) {
                return {
                    ok: false,
                    error: "You can't delete a restaurant that you don't own"
                }
            }
            let category: Category = null;
            if (editRestaurantInput.categoryName) {
                category = await this.categories.getOrCreate(
                    editRestaurantInput.categoryName
                );
            }
            await this.restaurants.save([
                {
                    id: editRestaurantInput.restaurantId,
                    ...editRestaurantInput,
                    ...(category && { category })
                }
            ])
            return {
                ok: true
            };
        } catch (error) {
            return {
                ok: false,
                error
            }
        }
    }

    async deleteRestaurant(
        owner: User,
        deleteRestaurantInput: DeleteRestaurantInput
    ): Promise<DeleteRestaurantOutput> {
        try {
            const restaurant = await this.restaurants.findOne(
                deleteRestaurantInput.restaurantId,
            );
            if (!restaurant) {
                return {
                    ok: false,
                    error: "Restaurant not found"
                };
            }
            if (owner.id !== restaurant.ownerId) {
                return {
                    ok: false,
                    error: "You can't delete a restaurant that you don't own"
                };
            }
            console.log('Will delete', restaurant);
            //await this.restaurants.delete(deleteRestaurantInput.restaurantId);
            return {
                ok: true
            };
        } catch {
            return {
                ok: false,
                error: "Couldn't delete restaurant"
            }
        }
    }

    async allCategories(): Promise<AllCategoriesOutput> {
        try {
            const categories = await this.categories.find();
            return {
                ok: true,
                categories
            }
        } catch {
            return {
                ok: false,
                error: "Could not load categories"
            }
        }
    }

    countRestaurants(category: Category) {
        return this.restaurants.count({ category });
    }

    async findCategoryBySlug(
        { slug, page }: CategoryInput
    ): Promise<CategoryOutput> {
        try {
            const category = await this.categories.findOne({ slug }, { relations: ['restaurants'] });
            if (!category) {
                return {
                    ok: false,
                    error: "Category not found"
                };
            }
            const restaurants = await this.restaurants.find({
                where: { category },
                take: 25, // 25개 데이터를 받겠음
                skip: (page - 1) * 25 // page 수에 따라 스킵할 데이터 수
            });
            category.restaurants = restaurants;
            const totalResults = await this.countRestaurants(category)
            return {
                ok: true,
                category,
                totalPages: Math.ceil(totalResults / 25)
            }
        } catch {
            return {
                ok: false,
                error: "Couldn't find categories"
            }
        }
    }
}