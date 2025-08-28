import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from 'src/app.service';
import { CouchbaseService } from 'src/couchbase/couchbase.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';

describe('AppService', () => {
  let appService: AppService;
  let couchbaseService: CouchbaseService;
  let jwtService: JwtService;

  const mockCouchbaseService = {
    upsertCode: jest.fn(),
    findUserByPhone: jest.fn(),
    checkCodeByPhone: jest.fn(),
    createUser: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: CouchbaseService,
          useValue: mockCouchbaseService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    appService = module.get<AppService>(AppService);
    couchbaseService = module.get<CouchbaseService>(CouchbaseService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(appService).toBeDefined();
  });

  describe('generateCode', () => {
    it('should generate a code with default length of 6', () => {
      const code = appService.generateCode();
      expect(code.length).toBe(6);
      expect(Number.isInteger(Number(code))).toBeTruthy();
    });

    it('should generate a code with specified length', () => {
      const length = 4;
      const code = appService.generateCode(length);
      expect(code.length).toBe(6);
      expect(Number.isInteger(Number(code))).toBeTruthy();
    });
  });

  describe('sendCode', () => {
    it('should send code successfully', async () => {
      const phone = '1234567890';
      const code = '123456';
      jest.spyOn(appService, 'generateCode').mockReturnValue(code);
      mockCouchbaseService.upsertCode.mockResolvedValue(true);

      await appService.sendCode(phone);

      expect(mockCouchbaseService.upsertCode).toHaveBeenCalledWith(phone, code);
    });
  });

  describe('login', () => {
    const phone = '1234567890';
    const code = '123456';
    const userData = { id: '1', phone, isEmployee: false };

    it('should login successfully', async () => {
      mockCouchbaseService.findUserByPhone.mockResolvedValue(userData);
      mockCouchbaseService.checkCodeByPhone.mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('token');

      const result = await appService.login(phone, code);

      expect(result).toHaveProperty('access_token', 'token');
      expect(mockCouchbaseService.findUserByPhone).toHaveBeenCalledWith(
        phone,
        true,
      );
      expect(mockCouchbaseService.checkCodeByPhone).toHaveBeenCalledWith(
        phone,
        code,
      );
    });

    it('should throw BadRequestException if phone not registered', async () => {
      mockCouchbaseService.findUserByPhone.mockResolvedValue(null);

      await expect(appService.login(phone, code)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockCouchbaseService.findUserByPhone).toHaveBeenCalledWith(
        phone,
        true,
      );
    });

    it('should throw BadRequestException if code is incorrect', async () => {
      mockCouchbaseService.findUserByPhone.mockResolvedValue(userData);
      mockCouchbaseService.checkCodeByPhone.mockResolvedValue(false);

      await expect(appService.login(phone, code)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('register', () => {
    const userData = {
      phone: '1234567890',
      code: '123456',
      name: 'Test User',
    };

    it('should register successfully', async () => {
      mockCouchbaseService.findUserByPhone.mockResolvedValue(null);
      mockCouchbaseService.checkCodeByPhone.mockResolvedValue(true);
      mockCouchbaseService.createUser.mockResolvedValue({
        ...userData,
        id: '1',
      });
      mockJwtService.signAsync.mockResolvedValue('token');

      const result = await appService.register(userData);

      expect(result).toHaveProperty('access_token', 'token');
      expect(mockCouchbaseService.createUser).toHaveBeenCalled();
    });

    it('should throw BadRequestException if phone already registered', async () => {
      mockCouchbaseService.findUserByPhone.mockResolvedValue({ id: '1' });

      await expect(appService.register(userData)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if code is incorrect', async () => {
      mockCouchbaseService.findUserByPhone.mockResolvedValue(null);
      mockCouchbaseService.checkCodeByPhone.mockResolvedValue(false);

      await expect(appService.register(userData)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('generateToken', () => {
    it('should generate token successfully', async () => {
      const user = { id: '1', phone: '1234567890', isEmployee: false };
      mockJwtService.signAsync.mockResolvedValue('token');

      const result = await appService.generateToken(user);

      expect(result).toHaveProperty('access_token', 'token');
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: user.id,
        username: user.phone,
        isEmployee: false,
      });
    });
  });
});
