import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateReservationDto {
  @Field()
  tableSize: number;

  @Field()
  expectedArrivalTime: string;

  @Field({ defaultValue: '' })
  user: string;

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
