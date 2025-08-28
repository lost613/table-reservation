import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SearchReservationDto {
  @Field({ nullable: true })
  expectedArrivalTime?: string;

  @Field({ nullable: true })
  status?: 'Requested' | 'Approved' | 'Cancelled' | 'Completed';

  @Field({ nullable: true })
  user?: string;
}
