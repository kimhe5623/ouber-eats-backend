import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class MutationOutput {
    @Field(type => String, { nullable: true })
    error?:string;       // error? -> error가 있다면 string

    @Field(type => Boolean)
    ok: boolean;
}