import {
    Injectable,
    NotFoundException,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './entities/users.entity';
import { CreateUserDto } from './dto/create-user-dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        @InjectRepository(Users)
        private userRepository: Repository<Users>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<Users> {
        try {
            const user = this.userRepository.create(createUserDto);
            return await this.userRepository.save(user);
        } catch (error) {
            const message =
                error instanceof Error ? error.stack : JSON.stringify(error);
            this.logger.error('Erro ao criar usuário', message);
            throw new InternalServerErrorException('Erro ao criar o usuário');
        }
    }

    async findAll(): Promise<Users[]> {
        try {
            return await this.userRepository.find();
        } catch (error) {
            const message =
                error instanceof Error ? error.stack : JSON.stringify(error);
            this.logger.error('Erro ao buscar usuários', message);
            throw new InternalServerErrorException(
                'Erro ao buscar os usuários',
            );
        }
    }

    async findByEmail(email: string): Promise<Users | null> {
        try {
            return await this.userRepository.findOneBy({ email });
        } catch (error) {
            const message =
                error instanceof Error ? error.stack : JSON.stringify(error);
            this.logger.error(
                `Erro ao buscar usuário com email: ${email}`,
                message,
            );
            throw new InternalServerErrorException(
                'Erro ao buscar o usuário pelo e-mail',
            );
        }
    }

    async findById(id: number): Promise<Users> {
        try {
            const user = await this.userRepository.findOneBy({ id });
            if (!user) {
                throw new NotFoundException('Usuário não encontrado');
            }
            return user;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            const message =
                error instanceof Error ? error.stack : JSON.stringify(error);

            this.logger.error(`Erro ao buscar usuário com ID: ${id}`, message);
            throw new InternalServerErrorException('Erro ao buscar o usuário');
        }
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<Users> {
        try {
            const user = await this.userRepository.findOneBy({ id });
            if (!user) {
                throw new NotFoundException('Usuário não encontrado');
            }

            Object.assign(user, updateUserDto);
            return await this.userRepository.save(user);
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            const message =
                error instanceof Error ? error.stack : JSON.stringify(error);

            this.logger.error(
                `Erro ao atualizar usuário com ID: ${id}`,
                message,
            );
            throw new InternalServerErrorException(
                'Erro ao atualizar o usuário',
            );
        }
    }

    async remove(id: number): Promise<void> {
        try {
            const result = await this.userRepository.softDelete(id);
            if (result.affected === 0) {
                throw new NotFoundException(
                    'Usuário não encontrado para remoção',
                );
            }
        } catch (error) {
            if (error instanceof NotFoundException) throw error;

            const message =
                error instanceof Error ? error.stack : JSON.stringify(error);
            this.logger.error(`Erro ao remover usuário com ID: ${id}`, message);
            throw new InternalServerErrorException('Erro ao remover o usuário');
        }
    }
}
