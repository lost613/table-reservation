import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  Ottoman,
  ModelTypes,
  FindByIdOptions,
  saveOptions,
  FindOneAndUpdateOption,
  FindOptions,
} from 'ottoman';
import { CodeSchema, ReservationSchema, UserSchema } from './schema';
import { removeOptions } from 'ottoman/lib/types/model/model.types';

@Injectable()
export class CouchbaseService {
  private readonly logger = new Logger(CouchbaseService.name);
  private readonly DOC_NOT_FOUND = 'document not found';
  private readonly CodeModel: ModelTypes;
  private readonly UserModel: ModelTypes;
  private readonly ReservationModel: ModelTypes;
  constructor(@Inject('Couchbase') ottoman: Ottoman) {
    this.CodeModel = ottoman.model('code', CodeSchema);
    this.UserModel = ottoman.model('user', UserSchema);
    this.ReservationModel = ottoman.model('reservation', ReservationSchema);
  }

  private generateDate(isCreating: boolean = false) {
    const date = new Date().toISOString();
    const result: { updated: string; created?: string } = {
      updated: date,
    };
    if (isCreating) {
      result.created = date;
    }
    return result;
  }

  async upsertCode(phone: string, code: string, expire: number = 300) {
    const result = await this.CodeModel.findOneAndUpdate(
      { phone },
      { phone, code },
      { maxExpiry: expire, upsert: true, new: true },
    );
    return result;
  }

  async checkCodeByPhone(phone: string, code: string) {
    try {
      const { id, code: codeToCheck } = await this.CodeModel.findOne({ phone });
      await this.CodeModel.removeById(id);
      return code === codeToCheck;
    } catch (error) {
      throw new BadRequestException(
        error.message === this.DOC_NOT_FOUND
          ? 'verification code expired'
          : error.message,
      );
    }
  }

  async findUserByPhone(phone: string, logger: boolean = false) {
    try {
      const user = await this.UserModel.findOne({ phone });
      return user;
    } catch (error) {
      if (logger) {
        this.logger.error(error.message, error.stack);
      }
      if (error.message === this.DOC_NOT_FOUND) {
        return null;
      }
      throw new BadRequestException(error.message);
    }
  }

  async createUser(user, options?: saveOptions) {
    this.logger.debug('createUser', { user, options });
    const data = await this.findUserByPhone(user.phone);
    if (data) {
      throw new BadRequestException(
        `the phone number[${user.phone}] already exists`,
      );
    }
    const result = await this.UserModel.create(
      {
        ...user,
        ...this.generateDate(true),
      },
      options,
    );
    return result;
  }

  async findUserById(id: string, options?: FindByIdOptions) {
    this.logger.debug('findUserById', { id, options });
    try {
      const result = await this.UserModel.findById(id, options);
      return result;
    } catch (error) {
      this.logger.warn(error.message, error.stack);
      return null;
    }
  }

  async createReservation(reservation, options?: saveOptions) {
    this.logger.debug('createReservation', { reservation, options });
    const result = await this.ReservationModel.create(
      {
        ...reservation,
        ...this.generateDate(true),
      },
      options,
    );
    return result;
  }

  async findReservationById(id, options?: FindByIdOptions) {
    this.logger.debug('findReservationById', { id, options });
    try {
      const result = await this.ReservationModel.findById(id, options);
      return result;
    } catch (error) {
      throw new BadRequestException(`[${id}] ${error.message}`);
    }
  }

  async findReservations(filter?, options?: FindOptions) {
    this.logger.debug('findReservations', { filter, options });
    const { rows } = await this.ReservationModel.find(filter, options);
    return rows;
  }

  async updateReservationById(id, update, options?: FindOneAndUpdateOption) {
    this.logger.debug('updateReservationById', { id, update, options });
    await this.findReservationById(id);
    const fields = [
      'expectedArrivalTime',
      'tableSize',
      'status',
      'name',
      'phone',
      'gender',
      'email',
      'comment',
    ];
    const updateObj = {};
    for (const field of fields) {
      if (field in update) {
        updateObj[field] = update[field];
      }
    }
    const result = await this.ReservationModel.findOneAndUpdate(
      { id },
      { ...updateObj, ...this.generateDate() },
      options,
    );
    return result;
  }

  async removeReservationById(id, options?: removeOptions) {
    this.logger.debug('removeReservationById', { id, options });
    const result = await this.ReservationModel.removeById(id, options);
    return result;
  }
}
