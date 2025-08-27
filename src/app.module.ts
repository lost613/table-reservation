import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { configuration } from './configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Ottoman } from 'ottoman';
import { DbService } from './db.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [
    {
      provide: 'Couchbase',
      useFactory: async (configService: ConfigService) => {
        const config =
          configService.get<string>('COUCHBASE_CONNECT_OPTIONS') || '';
        const ottoman: Ottoman = new Ottoman({ collectionName: '_default' });
        await ottoman.connect(config);
        return ottoman;
      },
      inject: [ConfigService],
    },
    DbService,
    AppService,
  ],
})
export class AppModule {}
