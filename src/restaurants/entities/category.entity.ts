import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsBoolean, IsOptional, IsString, Length } from "class-validator";
import { CoreEntity } from "src/common/entities/core.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Restaurant } from "./restaurant.entity";

@InputType("CategoryInputType", { isAbstract: true })
@ObjectType()
@Entity()
export class Category extends CoreEntity {
    @Field(type => String, { nullable: true })
    @Column()
    @IsString()
    @Length(5)
    name: string;

    @Field(type => String, { nullable: true })
    @Column({ nullable: true })
    @IsString()
    coverImage: string;

    @Field(type => String)
    @Column({ unique: true })
    @IsString()
    slug: String;

    @OneToMany(type => Restaurant, restaurant => restaurant.category)
    @Field(type => [Restaurant], { nullable: true })
    restaurants: Restaurant[];
}