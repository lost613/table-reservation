import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateReservationDto {
  @Field({ nullable: true })
  tableSize?: number;

  @Field({ nullable: true })
  expectedArrivalTime?: string;

  @Field({ nullable: true })
  status?: 'Requested' | 'Approved' | 'Cancelled' | 'Completed';

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
}
