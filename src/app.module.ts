import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import 'dotenv/config';
import { AppDataSource } from './database/typeorm.config';
import { HealthModule } from './health-checker/health.module';
import { UrlenconderModule } from './urlenconder/urlenconder.module';
import { AppService } from './app.service';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            ...AppDataSource.options,
            autoLoadEntities: true,
        }),
        UrlenconderModule,
        HealthModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
