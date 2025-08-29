import { Module } from '@nestjs/common';
import { ReservationsResolver } from './reservations.resolver';
import { ReservationsService } from './reservations.service';

@Module({
  providers: [ReservationsResolver, ReservationsService],
})
export class ReservationsModule {}
