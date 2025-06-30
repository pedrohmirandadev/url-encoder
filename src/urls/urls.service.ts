import { Injectable } from '@nestjs/common';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Urls } from './entities/urls.entity';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';

@Injectable()
export class UrlService {
    constructor(
        @InjectRepository(Urls)
        private urlRepository: Repository<Urls>,
    ) { }

    async create(createUrlDto: CreateUrlDto, user_id?: number) {
        try {
            const code = randomBytes(3).toString('hex');
            const url = this.urlRepository.create({
                ...createUrlDto,
                code,
                user: { id: user_id },
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
        const url = await this.urlRepository.findOneBy({ code });
        if (!url) {
            return null;
        }
        url.visit_quantity++;
        await this.urlRepository.save(url);
        return url;
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
