import { BadRequestException, Injectable } from '@nestjs/common';
import { CouchbaseService } from 'src/couchbase/couchbase.service';

@Injectable()
export class UsersService {
  constructor(private readonly couchbase: CouchbaseService) {}

  generateCode(len = 6) {
    const code: number[] = [];
    for (let i = 0; i < 6; i++) {
      code.push(Math.floor(Math.random() * len));
    }
    return code.join('');
  }

  async sendCode(phone: string) {
    const code = this.generateCode();
    return await this.couchbase.upsertCode(phone, code);
  }

  async login(phone: string, code: string) {
    const data = await this.couchbase.findUserByPhone(phone, true);
    if (!data) {
      throw new BadRequestException('phone number not registered');
    }
    if (await this.couchbase.checkCodeByPhone(phone, code)) {
      return { token: 'sss' };
    }
    throw new BadRequestException('incorrect verification code');
  }

  async register(user) {
    if (await this.couchbase.findUserByPhone(user.phone)) {
      throw new BadRequestException('phone number registered');
    }
    if (await this.couchbase.checkCodeByPhone(user.phone, user.code)) {
      delete user.code;
      const data = await this.couchbase.createUser(user);
      return { token: 'sss' };
    }
    throw new BadRequestException('incorrect verification code');
  }
}
