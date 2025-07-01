import { Module } from '@nestjs/common';
import { UrlService } from './urls.service';
import { UrlController } from './urls.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Urls } from './entities/urls.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Urls])],
    controllers: [UrlController],
    providers: [UrlService],
    exports: [UrlService],
})
export class UrlModule {}
