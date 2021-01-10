import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql"
import { User } from "../entities/user.entity"

@InputType()
export class CreateAccountInput extends PickType(User, [
    "email", 
    "password",
    "role"
]) {}

@ObjectType()
export class CreateAccountOutput {
    @Field(type => String, { nullable: true })
    error?:string;       // error? -> error가 있다면 string

    @Field(type => Boolean)
    ok: boolean;
}