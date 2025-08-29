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
  created: string;

  @Field()
  updated: string;
}
