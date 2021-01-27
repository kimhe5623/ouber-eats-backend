import { Inject } from "@nestjs/common";
import { Args, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql";
import { AuthUser } from "src/auth/auth-user.decorator";
import { Role } from "src/auth/role.decorator";
import { NEW_COOKED_ORDER, NEW_ORDER_UPDATE, NEW_PENDING_ORDER, PUB_SUB } from "src/common/common.constants";
import { CreateDishOutput } from "src/restaurants/dtos/create-dish.dto";
import { User } from "src/users/entities/user.entity";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { EditOrderInput, EditOrderOutput } from "./dtos/edit-order.dto";
import { GetOrderInput, GetOrderOutput } from "./dtos/get-order.dto";
import { GetOrdersInput, GetOrdersOutput } from "./dtos/get-orders.dto";
import { Order } from "./entities/order.entity";
import { OrderService } from "./orders.service";
import { PubSub } from "graphql-subscriptions";
import { pubsub } from "src/common/common.module";
import { OrderUpdatesInput } from "./dtos/order-updates.dto";
import { TakeOrderInput, TakeOrderOutput } from "src/users/dtos/take-order.dto";

@Resolver(of => Order)
export class OrderResolver {
  constructor(
    private readonly ordersService: OrderService,
    @Inject(PUB_SUB)
    private readonly pubSub: PubSub,
  ) { }

  @Mutation(returns => CreateOrderOutput)
  @Role(['Client'])
  createOrder(
    @AuthUser() customer: User,
    @Args('input') createOrderInput: CreateOrderInput
  ): Promise<CreateDishOutput> {
    return this.ordersService.createOrder(customer, createOrderInput);
  }

  @Query(returns => GetOrdersOutput)
  @Role(['Any'])
  getOrders(
    @AuthUser() user: User,
    @Args('input') getOrdersInput: GetOrdersInput
  ): Promise<GetOrdersOutput> {
    return this.ordersService.getOrders(user, getOrdersInput);
  }

  @Query(returns => GetOrderOutput)
  @Role(['Any'])
  getOrder(
    @AuthUser() user: User,
    @Args('input') getOrderInput: GetOrderInput
  ): Promise<GetOrderOutput> {
    return this.ordersService.getOrder(user, getOrderInput);
  }

  @Mutation(returns => EditOrderOutput)
  @Role(['Any'])
  editOrder(
    @AuthUser() user: User,
    @Args('input') editOrderInput: EditOrderInput
  ): Promise<EditOrderOutput> {
    return this.ordersService.editOrder(user, editOrderInput);
  }

  @Subscription(returns => Order, {
    filter: ({ pendingOrders: { order, ownerId } }, _, { user }) => {
      console.log(ownerId, user.id);
      return user.id === ownerId;
    },
    resolve: ({ pendingOrders: { order } }) => order
  })
  @Role(['Owner'])
  pendingOrders() {
    return this.pubSub.asyncIterator(NEW_PENDING_ORDER);
  }

  @Subscription(returns => Order, {
    resolve: ({ cookedOrders: order }) => order
  })
  @Role(['Delivery'])
  orderStatus() {
    return this.pubSub.asyncIterator(NEW_COOKED_ORDER);
  }

  @Subscription(returns => Order, {
    filter: (
      { orderUpdates: order }: { orderUpdates: Order },
      { input }: { input: OrderUpdatesInput },
      { user }: { user: User }
    ) => {
      if (
        order.driverId !== user.id &&
        order.customerId !== user.id &&
        order.restaurant.ownerId !== user.id
      ) {
        return false;
      }
      return order.id === input.id;
    },
    resolve: ({ orderUpdates: order }) => order
  })
  @Role(['Any'])
  orderUpdate(
    @Args('input') orderUpdatesInput: OrderUpdatesInput
  ) {
    return this.pubSub.asyncIterator(NEW_ORDER_UPDATE);
  }

  @Mutation(returns => TakeOrderOutput)
  @Role(['Delivery'])
  takeOrder(
    @AuthUser() driver,
    @Args('input') takeOrderInput: TakeOrderInput
  ): Promise<TakeOrderOutput> {
    return this.ordersService.takeOrder(driver, takeOrderInput);
  }
}