import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard, IS_PUBLIC_KEY } from 'src/guards/auth.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ClsService } from 'nestjs-cls';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

jest.mock('@nestjs/graphql', () => ({
  GqlExecutionContext: {
    create: jest.fn(),
  },
}));

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let configService: ConfigService;
  let jwtService: JwtService;
  let clsService: ClsService;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ClsService,
          useValue: {
            set: jest.fn(),
          },
        },
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    configService = module.get<ConfigService>(ConfigService);
    jwtService = module.get<JwtService>(JwtService);
    clsService = module.get<ClsService>(ClsService);
    reflector = module.get<Reflector>(Reflector);
  });

  describe('canActivate', () => {
    let mockExecutionContext: ExecutionContext;
    let mockGqlContext: any;
    let mockRequest: any;

    beforeEach(() => {
      mockRequest = {
        headers: {},
      };

      mockGqlContext = {
        getContext: jest.fn().mockReturnValue({ req: mockRequest }),
      };

      mockExecutionContext = {
        getType: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: () => mockRequest,
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as any;

      (GqlExecutionContext.create as jest.Mock).mockReturnValue(mockGqlContext);
    });

    it('should allow access for public routes', async () => {
      (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(jest.spyOn(jwtService, 'verifyAsync')).not.toHaveBeenCalled();
    });

    it('should handle REST API requests', async () => {
      mockRequest.headers.authorization = 'Bearer valid-token';
      const mockPayload = { sub: '123', username: 'test' };
      (jwtService.verifyAsync as jest.Mock).mockResolvedValue(mockPayload);
      (mockExecutionContext.getType as jest.Mock).mockReturnValue('http');

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(jest.spyOn(jwtService, 'verifyAsync')).toHaveBeenCalledWith(
        'valid-token',
        {
          secret: 'test-secret',
        },
      );
      expect(jest.spyOn(clsService, 'set')).toHaveBeenCalledWith(
        'user',
        mockPayload,
      );
    });

    it('should handle GraphQL requests', async () => {
      mockRequest.headers.authorization = 'Bearer valid-token';
      const mockPayload = { sub: '123', username: 'test' };
      (jwtService.verifyAsync as jest.Mock).mockResolvedValue(mockPayload);
      (mockExecutionContext.getType as jest.Mock).mockReturnValue('graphql');

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(jest.spyOn(jwtService, 'verifyAsync')).toHaveBeenCalledWith(
        'valid-token',
        {
          secret: 'test-secret',
        },
      );
      expect(jest.spyOn(clsService, 'set')).toHaveBeenCalledWith(
        'user',
        mockPayload,
      );
    });

    it('should throw UnauthorizedException when no token is provided', async () => {
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      mockRequest.headers.authorization = 'Bearer invalid-token';
      (jwtService.verifyAsync as jest.Mock).mockRejectedValue(new Error());

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle malformed authorization header', async () => {
      mockRequest.headers.authorization = 'invalid-format';

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
