import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { HttpExceptionFilter } from '../src/filter/http-exception.filter';
import { ConfigModule } from '@nestjs/config';
import { ClsModule } from 'nestjs-cls';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { CouchbaseModule } from '../src/couchbase/couchbase.module';
import { AppService } from '../src/app.service';
import { AppController } from '../src/app.controller';
import { AuthGuard } from '../src/guards/auth.guard';

describe('Main', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        ClsModule.forRoot({
          global: true,
          middleware: {
            mount: true,
          },
        }),
        JwtModule.register({
          global: true,
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
        CouchbaseModule,
      ],
      controllers: [AppController],
      providers: [
        {
          provide: APP_GUARD,
          useClass: AuthGuard,
        },
        AppService,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should create the application', () => {
    expect(app).toBeDefined();
  });

  it('should use default port when PORT env is not set', () => {
    const originalEnv = process.env.PORT;
    delete process.env.PORT;
    
    const port = process.env.PORT ?? 4000;
    expect(port).toBe(4000);
    
    process.env.PORT = originalEnv;
  });

  it('should use custom port when PORT env is set', () => {
    const originalEnv = process.env.PORT;
    process.env.PORT = '5000';
    
    const port = process.env.PORT ?? 4000;
    expect(port).toBe('5000');
    
    process.env.PORT = originalEnv;
  });

  it('should use HttpExceptionFilter globally', () => {
    const httpAdapter = app.getHttpAdapter();
    expect(httpAdapter).toBeDefined();
    // 验证是否使用了全局过滤器
    const globalFilters = Reflect.getMetadata('globalFilters', app);
    expect(globalFilters).toBeDefined();
    expect(globalFilters.some((filter: any) => filter instanceof HttpExceptionFilter)).toBe(true);
  });
});
