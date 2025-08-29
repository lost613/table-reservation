import { Field, ObjectType } from '@nestjs/graphql';
import { User } from './user.model';

@ObjectType({ description: 'reservation' })
export class Reservation {
  @Field()
  id: string;

  @Field()
  user: User;

  @Field()
  tableSize: number;

  @Field()
  expectedArrivalTime: string;

  @Field()
  status: 'Requested' | 'Approved' | 'Cancelled' | 'Completed';

  @Field()
  name: string;

  @Field()
  phone: string;

  @Field()
  gender: 'M' | 'F';

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  comment?: string;

  @Field()
  created: string;

  @Field()
  updated: string;
}
