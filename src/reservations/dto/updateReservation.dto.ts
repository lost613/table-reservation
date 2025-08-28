import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateReservationDto {
  @Field({ nullable: true })
  tableSize?: number;

  @Field({ nullable: true })
  expectedArrivalTime?: string;

  @Field({ nullable: true })
  status?: 'Requested' | 'Approved' | 'Cancelled' | 'Completed';
}
