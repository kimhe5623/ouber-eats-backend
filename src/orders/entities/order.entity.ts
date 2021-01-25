import { Field, Float, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { IsNumber} from "class-validator";
import { CoreEntity } from "src/common/entities/core.entity";
import { Dish } from "src/restaurants/entities/dish.entity";
import { Restaurant } from "src/restaurants/entities/restaurant.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from "typeorm";

export enum OrderStatus {
    Pending = 'Pending',
    Cooking = 'Cooking',
    PickedUp = 'PickedUp',
    Delivered = 'Delivered'
}

registerEnumType(OrderStatus, { name: "OrderStatus" });

@InputType('OrderInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity{

    @Field(type => User, { nullable: true }) // customer이 nullable인 이유?
    @ManyToOne(
        type => User, 
        user => user.orders,
        { nullable: true, onDelete: "SET NULL"}) // user를 지운다고 해도 order가 사라지지 않도록 하기 위함
    customer: User;

    @Field(type => User, { nullable: true })
    @ManyToOne(
        type => User, 
        user => user.rides,
        { nullable: true, onDelete: "SET NULL"}) // driver를 지운다고 해도 order가 사라지지 않도록 하기 위함
    driver: User;

    @Field(type => Restaurant, { nullable: true })
    @ManyToOne(
        type => Restaurant, 
        restaurant => restaurant.orders,
        { nullable: true, onDelete: "SET NULL"}) // user를 지운다고 해도 order가 사라지지 않도록 하기 위함
    restaurant: Restaurant;

    @Field(type => [Dish])  // many to many relationship
    @ManyToMany(type => Dish)
    @JoinTable()            // Join Table은 소유(owning)하고 있는 쪽의 relation에 추가해주면 됨
    dishes: Dish[];

    @Field(type => Float)
    @Column()
    @IsNumber()
    total: number;

    @Field(type => OrderStatus)
    @Column({ type: "enum", enum: OrderStatus })
    status: OrderStatus;
}