import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateReservationDto {
  @Field()
  tableSize: number;

  @Field()
  expectedArrivalTime: string;

  @Field({ defaultValue: '' })
  user: string;
}
