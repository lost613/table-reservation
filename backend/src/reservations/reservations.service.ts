import { Injectable } from '@nestjs/common';
import { Reservation } from './models/reservation.model';
import { CouchbaseService } from 'src/couchbase/couchbase.service';
import { CreateReservationDto } from './dto/createReservation.dto';
import { UpdateReservationDto } from './dto/updateReservation.dto';

@Injectable()
export class ReservationsService {
  constructor(private readonly couchbase: CouchbaseService) {}

  async create(data: CreateReservationDto): Promise<Reservation> {
    const [user, result] = await Promise.all([
      this.couchbase.findUserById(data.user, {
        lean: true,
      }),
      this.couchbase.createReservation(data, { enforceRefCheck: 'throw' }),
    ]);
    return { ...result, user };
  }

  async findById(id: string): Promise<Reservation> {
    const result = await this.couchbase.findReservationById(id, {
      lean: true,
      populate: 'user',
    });
    return result;
  }

  async updateById(
    id: string,
    data: UpdateReservationDto,
  ): Promise<Reservation> {
    const result = await this.couchbase.updateReservationById(id, data, {
      new: true,
    });
    const user = await this.couchbase.findUserById(result.user);
    return { ...result, user };
  }

  async findAll(searchReservationDto): Promise<Reservation[]> {
    const filter: {
      expectedArrivalTime?: { $like: string };
      status?: string;
      user?: string;
    } = {};
    if (searchReservationDto?.expectedArrivalTime) {
      filter.expectedArrivalTime = {
        $like: `%${new Date(searchReservationDto.expectedArrivalTime).toISOString().substring(0, 10)}%`,
      };
    }
    if (searchReservationDto?.status) {
      filter.status = searchReservationDto.status;
    }
    if (searchReservationDto?.user) {
      filter.user = searchReservationDto.user;
    }
    const result = await this.couchbase.findReservations(filter, {
      lean: true,
      populate: 'user',
    });
    return result;
  }

  async remove(id: string): Promise<boolean> {
    await this.couchbase.removeReservationById(id);
    return true;
  }
}
