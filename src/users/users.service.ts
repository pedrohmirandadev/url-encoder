import {
    Injectable,
    NotFoundException,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './entities/users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        @InjectRepository(Users)
        private userRepository: Repository<Users>,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<Users> {
        try {
            const user = this.userRepository.create(createUserDto);
            return await this.userRepository.save(user);
        } catch (error) {
            const message =
                error instanceof Error ? error.stack : JSON.stringify(error);
            this.logger.error('Error creating user', message);
            throw new InternalServerErrorException('Failed to create user');
        }
    }

    async findAll(): Promise<Users[]> {
        try {
            return await this.userRepository.find();
        } catch (error) {
            const message =
                error instanceof Error ? error.stack : JSON.stringify(error);
            this.logger.error('Error fetching users', message);
            throw new InternalServerErrorException('Failed to fetch users');
        }
    }

    async findByEmail(email: string): Promise<Users | null> {
        try {
            return await this.userRepository.findOneBy({ email });
        } catch (error) {
            const message =
                error instanceof Error ? error.stack : JSON.stringify(error);
            this.logger.error(
                `Error fetching user with email: ${email}`,
                message,
            );
            throw new InternalServerErrorException(
                'Failed to fetch user by email',
            );
        }
    }

    async findById(id: number): Promise<Users> {
        try {
            const user = await this.userRepository.findOneBy({ id });
            if (!user) {
                throw new NotFoundException('User not found');
            }
            return user;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;

            const message =
                error instanceof Error ? error.stack : JSON.stringify(error);
            this.logger.error(`Error fetching user with ID: ${id}`, message);
            throw new InternalServerErrorException('Failed to fetch user');
        }
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<Users> {
        try {
            const user = await this.userRepository.findOneBy({ id });
            if (!user) {
                throw new NotFoundException('User not found');
            }

            Object.assign(user, updateUserDto);
            return await this.userRepository.save(user);
        } catch (error) {
            if (error instanceof NotFoundException) throw error;

            const message =
                error instanceof Error ? error.stack : JSON.stringify(error);
            this.logger.error(`Error updating user with ID: ${id}`, message);
            throw new InternalServerErrorException('Failed to update user');
        }
    }

    async remove(id: number): Promise<void> {
        try {
            const result = await this.userRepository.softDelete(id);
            if (result.affected === 0) {
                throw new NotFoundException('User not found for deletion');
            }
        } catch (error) {
            if (error instanceof NotFoundException) throw error;

            const message =
                error instanceof Error ? error.stack : JSON.stringify(error);
            this.logger.error(`Error deleting user with ID: ${id}`, message);
            throw new InternalServerErrorException('Failed to delete user');
        }
    }
}
