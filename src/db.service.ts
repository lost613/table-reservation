import { Inject, Injectable } from '@nestjs/common';
import { Ottoman, ModelTypes } from 'ottoman';
import { ReservationSchema, UserSchema } from './schema';

@Injectable()
export class DbService {
  private readonly UserModel: ModelTypes;
  private readonly ReservationModel: ModelTypes;
  constructor(@Inject('Couchbase') ottoman: Ottoman) {
    this.UserModel = ottoman.model('user', UserSchema);
    this.ReservationModel = ottoman.model('reservation', ReservationSchema);
  }
}
