import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    Logger,
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
            const message =
                error instanceof Error ? error.stack : JSON.stringify(error);
            this.logger.error('Erro ao criar URL', message);
            throw new InternalServerErrorException('Erro ao criar URL');
        }
    }

    async findManyByUser(user_id: number) {
        try {
            return await this.urlRepository.find({
                where: { user: { id: user_id } },
            });
        } catch (error) {
            const message =
                error instanceof Error ? error.stack : JSON.stringify(error);
            this.logger.error(
                `Erro ao buscar URLs do usuário ${user_id}`,
                message,
            );
            throw new InternalServerErrorException(
                'Erro ao buscar URLs do usuário',
            );
        }
    }

    async findAll() {
        try {
            return await this.urlRepository.find();
        } catch (error) {
            const message =
                error instanceof Error ? error.stack : JSON.stringify(error);
            this.logger.error('Erro ao buscar todas as URLs', message);
            throw new InternalServerErrorException('Erro ao buscar URLs');
        }
    }

    async findByCode(code: string) {
        try {
            const url = await this.urlRepository.findOneBy({ code });
            if (!url) {
                throw new NotFoundException('URL não encontrada');
            }

            url.visit_quantity++;
            await this.urlRepository.save(url);
            return url;
        } catch (error) {
            const message =
                error instanceof Error ? error.stack : JSON.stringify(error);
            this.logger.error(
                `Erro ao buscar ou atualizar URL com código ${code}`,
                message,
            );
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException('Erro ao buscar a URL');
        }
    }

    async update(id: number, updateUrlDto: UpdateUrlDto) {
        try {
            const result = await this.urlRepository.update(id, updateUrlDto);
            if (result.affected === 0) {
                throw new NotFoundException(
                    'URL não encontrada para atualização',
                );
            }
            return result;
        } catch (error) {
            const message =
                error instanceof Error ? error.stack : JSON.stringify(error);
            this.logger.error(`Erro ao atualizar URL com ID ${id}`, message);
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException('Erro ao atualizar URL');
        }
    }

    async remove(id: number) {
        try {
            const result = await this.urlRepository.softDelete(id);
            if (result.affected === 0) {
                throw new NotFoundException('URL não encontrada para exclusão');
            }
            return result;
        } catch (error) {
            const message =
                error instanceof Error ? error.stack : JSON.stringify(error);
            this.logger.error(`Erro ao remover URL com ID ${id}`, message);
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException('Erro ao remover URL');
        }
    }
}
