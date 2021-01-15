import { Field, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/entities/core.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity } from "typeorm";
import * as bcrypt from "bcrypt";
import { InternalServerErrorException } from "@nestjs/common";
import { IsEmail, IsEnum } from "class-validator";

enum UserRole {
    Client,     // 0
    Owner,      // 1
    Delivery,   // 2
}

registerEnumType(UserRole, {name: "UserRole"}); // for GraphQl Type

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity{

    @Column()
    @Field(type => String)
    @IsEmail()
    email: string;

    @Column({ select: false })
    @Field(type => String)
    password: string;

    @Column({ type: "enum", enum: UserRole })
    @Field(type => UserRole)
    @IsEnum(UserRole)
    role: UserRole;

    @Column({ default: false })
    @Field(type => Boolean)
    verified: boolean;

    @BeforeUpdate()
    @BeforeInsert()
    async hashPassword(): Promise<void> {
        if(this.password) {
            try {
                this.password = await bcrypt.hash(this.password, 10);
            } catch(e) {
                console.log(e);
                throw new InternalServerErrorException();
            }
        }
    }

    async checkPassword(aPassword: string): Promise<boolean> {
        try {
            const result = await bcrypt.compare(aPassword, this.password);
            return result;
        } catch(e) {
            console.log(e);
            throw new InternalServerErrorException();
        }
    }
}