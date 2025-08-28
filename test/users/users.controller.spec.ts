import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from 'src/users/users.controller';
import { UsersService } from 'src/users/users.service';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            sendCode: jest.fn(),
            register: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    usersController = app.get<UsersController>(UsersController);
    usersService = app.get<UsersService>(UsersService);
  });

  const name = 'Tom';
  const phone = '15912345678';
  const code = '123456';
  const token = 'token';

  describe('sendCode', () => {
    it('should send code successfully', async () => {
      jest
        .spyOn(usersService, 'sendCode')
        .mockResolvedValueOnce({ phone, code });
      expect(await usersController.sendCode({ phone })).toEqual({
        phone,
        code,
      });
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      jest.spyOn(usersService, 'register').mockResolvedValueOnce({ token });
      expect(await usersController.register({ name, phone, code })).toEqual({
        token,
      });
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      jest.spyOn(usersService, 'login').mockResolvedValueOnce({ token });
      expect(await usersController.login({ phone, code })).toEqual({
        token,
      });
    });
  });
});
