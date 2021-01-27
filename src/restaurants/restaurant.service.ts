import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateAccountOutput } from "src/users/dtos/create-account.dto";
import { User } from "src/users/entities/user.entity";
import { Like, Raw, Repository } from "typeorm";
import { AllCategoriesOutput } from "./dtos/all-categories.dto";
import { CategoryInput, CategoryOutput } from "./dtos/category.dto";
import { CreateDishInput, CreateDishOutput } from "./dtos/create-dish.dto";
import { CreateRestaurantInput } from "./dtos/create-restaurant.dto";
import { DeleteDishInput, DeleteDishOutput } from "./dtos/delete-dish.dto";
import { DeleteRestaurantInput, DeleteRestaurantOutput } from "./dtos/delete-restaurant.dto";
import { EditDishInput, EditDishOutput } from "./dtos/edit-dish.dto";
import { EditRestaurantInput, EditRestaurantOutput } from "./dtos/edit-restaurant.dto";
import { RestaurantInput, RestaurantOutput } from "./dtos/restaurant.dto";
import { RestaurantsInput, RestaurantsOutput } from "./dtos/restaurants.dto";
import { SearchRestaurantInput, SearchRestaurantOutput } from "./dtos/search-restaurant.dto";
import { Category } from "./entities/category.entity";
import { Dish } from "./entities/dish.entity";
import { Restaurant } from "./entities/restaurant.entity";
import { CategoryRepository } from "./repositories/category.repository"

@Injectable()
export class RestaurantService {
    constructor(
        @InjectRepository(Restaurant)
        private readonly restaurants: Repository<Restaurant>,
        @InjectRepository(Dish)
        private readonly dishes: Repository<Dish>,
        private readonly categories: CategoryRepository,
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
                take: 25,
                skip: (page - 1) * 25,
                order: {
                  isPromoted: "DESC"
                }
            });
            category.restaurants = restaurants;
            const totalResults = await this.countRestaurants(category)
            return {
                ok: true,
                category,
                totalPages: Math.ceil(totalResults / 25),
                totalResults
            }
        } catch {
            return {
                ok: false,
                error: "Couldn't find categories"
            }
        }
    }

    async allRestaurants(
        { page }: RestaurantsInput
    ): Promise<RestaurantsOutput> {
        try {
            const [results, totalResults] = await this.restaurants.findAndCount({
                take: 25,
                skip: (page - 1) * 25,
                order: {
                  isPromoted: "DESC"
                }
            });
            return {
                ok: true,
                results,
                totalPages: Math.ceil(totalResults / 25),
                totalResults
            }
        } catch {
            return {
                ok: false,
                error: "Couldn't load restaurants"
            }
        }
    }

    async findRestaurantById(
        { restaurantId }: RestaurantInput
    ): Promise<RestaurantOutput> {
        try {
            const restaurant = await this.restaurants.findOne(restaurantId,
                { relations: ['menu'] }
            );
            if (!restaurant) {
                return {
                    ok: false,
                    error: "Restaurant not found",
                };
            }
            return {
                ok: true,
                restaurant
            }
        } catch {
            return {
                ok: false,
                error: "Couldn't find restaurant"
            }
        }
    }

    async searchRestaurantByName(
        { query, page }: SearchRestaurantInput
    ): Promise<SearchRestaurantOutput> {
        try {
            const [restaurants, totalResults] = await this.restaurants.findAndCount({
                where: {
                    name: Raw(name => `${name} ILIKE '%${query}%'`)
                },
                take: 25,
                skip: (page - 1) * 25,
                order: {
                  isPromoted: "DESC"
                }
            });
            return {
                ok: true,
                restaurants,
                totalPages: Math.ceil(totalResults / 25),
                totalResults
            };
        } catch {
            return {
                ok: false,
                error: "Couldn't search for restaurants"
            }
        }
    }
    async createDish(
        owner: User,
        createDishInput: CreateDishInput
    ): Promise<CreateDishOutput> {
        try {
            const restaurant = await this.restaurants.findOne(
                createDishInput.restaurantId
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
                    error: "Only owner can do it"
                };
            }
            const newDish = await this.dishes.save(
                this.dishes.create({ ...createDishInput, restaurant })
            );
            return {
                ok: true
            };
        } catch {
            return {
                ok: false,
                error: "Couldn't create dish"
            };
        }
    }

    async editDish(
        owner: User,
        editDishInput: EditDishInput
    ): Promise<EditDishOutput> {
        try {
            const dish = await this.dishes.findOne(editDishInput.dishId, {
                relations: ['restaurant']
            });
            if (!dish) {
                return {
                    ok: false,
                    error: "Dish not found"
                };
            }
            if (owner.id !== dish.restaurant.ownerId) {
                return {
                    ok: false,
                    error: "Only owner can do it"
                };
            }
            await this.dishes.save([
                {
                    id: editDishInput.dishId,
                    ...editDishInput
                }
            ]);
            return {
                ok: true
            };
        } catch (error) {
            console.log(error);
            return {
                ok: false,
                error: "Couldn't edit dish"
            };
        }
    }

    async deleteDish(
        owner: User,
        { dishId }: DeleteDishInput
    ): Promise<DeleteDishOutput> {
        try {
            const dish = await this.dishes.findOne(dishId, {
                relations: ['restaurant']
            });
            if (!dish) {
                return {
                    ok: false,
                    error: "Dish not found"
                };
            }
            if (owner.id !== dish.restaurant.ownerId) {
                return {
                    ok: false,
                    error: "Only owner can do it"
                };
            }
            await this.dishes.delete(dishId);
            return {
                ok: true
            };
        } catch (error) {
            console.log(error);
            return {
                ok: false,
                error: "Couldn't delete dish"
            }
        }
    }
}