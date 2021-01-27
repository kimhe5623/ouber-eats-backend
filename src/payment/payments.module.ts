import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Payment } from './entities/payment.entity';
import { PaymentResolver } from './payments.resolver';
import { PaymentsService } from './payments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment, Restaurant,
    ]),
  ],
  providers: [PaymentsService, PaymentResolver]
})
export class PaymentsModule { }
