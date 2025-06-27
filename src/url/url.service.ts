import { Injectable } from '@nestjs/common';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Url } from './entities/url.entity';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';

@Injectable()
export class UrlService {
    constructor(
        @InjectRepository(Url)
        private urlRepository: Repository<Url>,
    ) {}

    async create(createUrlDto: CreateUrlDto) {
        try {
            const code = randomBytes(4).toString('hex');
            const url = this.urlRepository.create({
                ...createUrlDto,
                code,
            });
            await this.urlRepository.save(url);
            return {
                shortUrl: `${process.env.BASE_URL}:${process.env.PORT}/${code}`,
            };
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async findAll() {
        try {
            return await this.urlRepository.find();
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async findByCode(code: string) {
        return await this.urlRepository.findOneBy({ code });
    }

    async update(id: number, updateUrlDto: UpdateUrlDto) {
        try {
            return await this.urlRepository.update(id, updateUrlDto);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async remove(id: number) {
        try {
            return await this.urlRepository.softDelete(id);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}
