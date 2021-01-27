import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { AuthUser } from "src/auth/auth-user.decorator";
import { Role } from "src/auth/role.decorator";
import { User } from "src/users/entities/user.entity";
import { CreatePaymentInput, CreatePaymentOutput } from "./dtos/create-payment.dto";
import { GetPaymentsOutput } from "./dtos/get-payments.dto";
import { Payment } from "./entities/payment.entity";
import { PaymentsService } from "./payments.service";
import { SchedulerRegistry } from '@nestjs/schedule';

@Resolver(of => Payment)
export class PaymentResolver {
  constructor(
    private readonly paymentsService: PaymentsService,
    private schedulerRegistry: SchedulerRegistry,
  ) { }

  @Mutation(returns => CreatePaymentOutput)
  @Role(['Owner'])
  createPayment(
    @AuthUser() owner: User,
    @Args('input') createPaymentInput: CreatePaymentInput
  ): Promise<CreatePaymentOutput> {
    return this.paymentsService.createPayment(owner, createPaymentInput);
  }

  @Query(returns => GetPaymentsOutput)
  @Role(['Owner'])
  getPayments(
    @AuthUser() owner: User
  ): Promise<GetPaymentsOutput> {
    return this.paymentsService.getPayments(owner);
  }
}