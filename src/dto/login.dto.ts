import {
  IsMobilePhone,
  IsNotEmpty,
  IsNumberString,
  IsString,
  Length,
} from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  @IsMobilePhone('zh-CN')
  phone: string;

  @IsNotEmpty()
  @IsNumberString()
  @Length(6, 6)
  code: string;
}
