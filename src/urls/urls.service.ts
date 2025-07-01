import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    Logger,
    ForbiddenException,
} from '@nestjs/common';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Urls } from './entities/urls.entity';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';

@Injectable()
export class UrlService {
    private readonly logger = new Logger(UrlService.name);

    constructor(
        @InjectRepository(Urls)
        private urlRepository: Repository<Urls>,
    ) {}

    async create(createUrlDto: CreateUrlDto, userId?: number) {
        try {
            const code = randomBytes(3).toString('hex');
            const url = this.urlRepository.create({
                ...createUrlDto,
                code,
                user: { id: userId },
            });
            await this.urlRepository.save(url);
            return {
                shortUrl: `${process.env.BASE_URL}:${process.env.PORT}/${code}`,
            };
        } catch (error) {
            const message =
                error instanceof Error ? error.stack : JSON.stringify(error);
            this.logger.error('Error creating URL', message);
            throw new InternalServerErrorException('Failed to create URL');
        }
    }

    async findManyByUser(userId: number) {
        try {
            return await this.urlRepository.find({
                where: { user: { id: userId } },
            });
        } catch (error) {
            const message =
                error instanceof Error ? error.stack : JSON.stringify(error);
            this.logger.error(
                `Error retrieving URLs for user ${userId}`,
                message,
            );
            throw new InternalServerErrorException(
                'Failed to retrieve user URLs',
            );
        }
    }

    async findAll() {
        try {
            return await this.urlRepository.find();
        } catch (error) {
            const message =
                error instanceof Error ? error.stack : JSON.stringify(error);
            this.logger.error('Error retrieving all URLs', message);
            throw new InternalServerErrorException('Failed to retrieve URLs');
        }
    }

    async findAndTrackVisitByCode(code: string) {
        try {
            const url = await this.urlRepository.findOneBy({ code });
            if (!url) {
                throw new NotFoundException('URL not found');
            }

            url.visit_quantity++;
            await this.urlRepository.save(url);
            return url;
        } catch (error) {
            const message =
                error instanceof Error ? error.stack : JSON.stringify(error);
            this.logger.error(
                `Error retrieving or updating URL with code ${code}`,
                message,
            );
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException('Failed to retrieve URL');
        }
    }

    async update(id: number, updateUrlDto: UpdateUrlDto, userId: number) {
        const url = await this.urlRepository.findOneBy({ id });
        if (!url) {
            throw new NotFoundException('URL not found');
        }

        if (url.user?.id !== userId) {
            throw new ForbiddenException(
                'You are not authorized to update this URL',
            );
        }

        try {
            return await this.urlRepository.update(id, updateUrlDto);
        } catch (error) {
            const message =
                error instanceof Error ? error.stack : JSON.stringify(error);
            this.logger.error(`Error updating URL with ID ${id}`, message);
            throw new InternalServerErrorException('Failed to update URL');
        }
    }

    async remove(id: number, userId: number) {
        const url = await this.urlRepository.findOneBy({ id });
        if (!url) {
            throw new NotFoundException('URL not found');
        }

        if (url.user?.id !== userId) {
            throw new ForbiddenException(
                'You are not authorized to delete this URL',
            );
        }

        try {
            return await this.urlRepository.softDelete(id);
        } catch (error) {
            const message =
                error instanceof Error ? error.stack : JSON.stringify(error);
            this.logger.error(`Error deleting URL with ID ${id}`, message);
            throw new InternalServerErrorException('Failed to delete URL');
        }
    }
}
