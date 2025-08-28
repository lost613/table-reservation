import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            sendCode: jest.fn(),
            register: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });

  const name = 'Tom';
  const phone = '15912345678';
  const code = '123456';
  const access_token = 'token';

  describe('sendCode', () => {
    it('should send code successfully', async () => {
      jest.spyOn(appService, 'sendCode').mockResolvedValueOnce({ phone, code });
      expect(await appController.sendCode({ phone })).toEqual({
        phone,
        code,
      });
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      jest
        .spyOn(appService, 'register')
        .mockResolvedValueOnce({ access_token });
      expect(await appController.register({ name, phone, code })).toEqual({
        access_token,
      });
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      jest.spyOn(appService, 'login').mockResolvedValueOnce({ access_token });
      expect(await appController.login({ phone, code })).toEqual({
        access_token,
      });
    });
  });
});
