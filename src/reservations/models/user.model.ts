import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'user' })
export class User {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  phone: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  gender?: 'M' | 'F';

  @Field({ nullable: true })
  isEmployee?: boolean;

  @Field()
  created: string;

  @Field()
  updated: string;
}
