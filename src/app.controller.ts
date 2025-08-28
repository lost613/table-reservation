import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AppService } from './app.service';
import { CreateUserDto } from './dto/createUser.dto';
import { SendCodeDto } from './dto/sendCode.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from 'src/guards/auth.guard';

@Public()
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    transformOptions: { exposeDefaultValues: false, exposeUnsetFields: false },
  }),
)
@Controller()
export class AppController {
  constructor(private readonly usersService: AppService) {}

  @Post('code')
  async sendCode(@Body() sendCodeDto: SendCodeDto): Promise<string> {
    return await this.usersService.sendCode(sendCodeDto.phone);
  }

  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<{ access_token: string }> {
    return await this.usersService.register(createUserDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<{ access_token: string }> {
    const { phone, code } = loginDto;
    return await this.usersService.login(phone, code);
  }
}
