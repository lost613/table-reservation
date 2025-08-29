import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Reservation } from './models/reservation.model';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/createReservation.dto';
import { UpdateReservationDto } from './dto/updateReservation.dto';
import { ForbiddenException, Logger, NotFoundException } from '@nestjs/common';
import { SearchReservationDto } from './dto/searchReservation.dto';
import { ClsService } from 'nestjs-cls';

@Resolver((of) => Reservation)
export class ReservationsResolver {
  private readonly logger = new Logger(ReservationsResolver.name);
  constructor(
    private readonly clsService: ClsService,
    private readonly reservationsService: ReservationsService,
  ) {}

  @Query((returns) => Reservation)
  async reservation(@Args('id') id: string): Promise<Reservation> {
    this.logger.debug('reservation', { id });
    return await this.checkAndGetReservation(id);
  }

  @Query((returns) => [Reservation])
  async reservations(
    @Args('searchReservationDto', { nullable: true })
    searchReservationDto?: SearchReservationDto,
  ): Promise<Reservation[]> {
    this.logger.debug('reservations');
    const user = this.clsService.get('user');
    if (!user.isEmployee && searchReservationDto) {
      searchReservationDto.user = user.sub;
    }
    return await this.reservationsService.findAll(searchReservationDto);
  }

  @Mutation((returns) => Reservation)
  async addReservation(
    @Args('createReservationDto') createReservationDto: CreateReservationDto,
  ): Promise<Reservation> {
    this.logger.debug('addReservation', { createReservationDto });
    const user = this.clsService.get('user');
    createReservationDto.user = user.sub;
    return await this.reservationsService.create(createReservationDto);
  }

  @Mutation((returns) => Reservation)
  async editReservation(
    @Args('id') id: string,
    @Args('updateReservationDto') updateReservationDto: UpdateReservationDto,
  ) {
    this.logger.debug('editReservation', { id, updateReservationDto });
    await this.checkAndGetReservation(id);
    return await this.reservationsService.updateById(id, updateReservationDto);
  }

  @Mutation((returns) => Boolean)
  async removeReservation(@Args('id') id: string) {
    this.logger.debug('removeReservation', { id });
    await this.checkAndGetReservation(id);
    return await this.reservationsService.remove(id);
  }

  async checkAndGetReservation(id: string) {
    const user = this.clsService.get('user');
    const reservation = await this.reservationsService.findById(id);
    if (!reservation) {
      throw new NotFoundException(id);
    }
    if (!user.isEmployee) {
      if (user.sub !== reservation.user.id) {
        throw new ForbiddenException('Access Denied');
      }
    }
    return reservation;
  }
}
