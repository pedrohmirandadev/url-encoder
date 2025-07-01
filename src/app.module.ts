import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import 'dotenv/config';
import { AppDataSource } from './database/typeorm.config';
import { ObservabilityModule } from './observability/observability.module';
import { AppService } from './app.service';
import { UrlModule } from './urls/urls.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            ...AppDataSource.options,
            autoLoadEntities: true,
        }),
        ObservabilityModule,
        UrlModule,
        AuthModule,
        UsersModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
