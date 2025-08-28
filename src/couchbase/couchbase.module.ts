import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Ottoman } from 'ottoman';
import { CouchbaseService } from './couchbase.service';

@Global()
@Module({
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
    CouchbaseService,
  ],
  exports: ['Couchbase', CouchbaseService],
})
export class CouchbaseModule {}
