import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service"

@Resolver(of => User)
export class UserResolver {
    constructor(private readonly usersService: UsersService) {}

    @Query(returns => Boolean)
    hi() {
        return false;
    }

    @Mutation(returns => CreateAccountOutput)
    createAccount(
        @Args('intput') createAccountInput: CreateAccountInput
    ) {

    }
}