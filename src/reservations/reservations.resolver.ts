import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Reservation } from './models/reservation.model';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/createReservation.dto';
import { UpdateReservationDto } from './dto/updateReservation.dto';
import { Logger, NotFoundException } from '@nestjs/common';
import { SearchReservationDto } from './dto/searchReservation.dto';

@Resolver((of) => Reservation)
export class ReservationsResolver {
  private readonly logger = new Logger(ReservationsResolver.name);
  constructor(private readonly reservationsService: ReservationsService) {}

  @Query((returns) => Reservation)
  async reservation(@Args('id') id: string): Promise<Reservation> {
    this.logger.debug('reservation', { id });
    const reservation = await this.reservationsService.findById(id);
    if (!reservation) {
      throw new NotFoundException(id);
    }
    return reservation;
  }

  @Query((returns) => [Reservation])
  async reservations(
    @Args('searchReservationDto') searchReservationDto: SearchReservationDto,
  ): Promise<Reservation[]> {
    this.logger.debug('reservations');
    return await this.reservationsService.findAll(searchReservationDto);
  }

  @Mutation((returns) => Reservation)
  async addReservation(
    @Args('createReservationDto') createReservationDto: CreateReservationDto,
  ): Promise<Reservation> {
    this.logger.debug('addReservation', { createReservationDto });
    return await this.reservationsService.create(createReservationDto);
  }

  @Mutation((returns) => Reservation)
  async editReservation(
    @Args('id') id: string,
    @Args('updateReservationDto') updateReservationDto: UpdateReservationDto,
  ) {
    this.logger.debug('editReservation', { id, updateReservationDto });
    return await this.reservationsService.updateById(id, updateReservationDto);
  }

  @Mutation((returns) => Boolean)
  async removeReservation(@Args('id') id: string) {
    this.logger.debug('removeReservation', { id });
    return await this.reservationsService.remove(id);
  }
}
