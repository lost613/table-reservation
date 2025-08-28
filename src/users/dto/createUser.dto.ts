import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsMobilePhone,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @IsMobilePhone('zh-CN')
  phone: string;

  @IsNotEmpty()
  @IsNumberString()
  @Length(6, 6)
  code: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsIn(['M', 'F'])
  gender?: 'M' | 'F';

  @IsOptional()
  @IsBoolean()
  isEmployee?: boolean;
}
