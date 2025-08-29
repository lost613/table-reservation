import { IsMobilePhone, IsNotEmpty, IsString } from 'class-validator';

export class SendCodeDto {
  @IsNotEmpty()
  @IsString()
  @IsMobilePhone('zh-CN')
  phone: string;
}
