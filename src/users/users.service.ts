import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './entities/users.entity';
import { CreateUserDto } from './dto/create-user-dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(Users)
        private userRepository: Repository<Users>,
    ) { }

    async create(createUserDto: CreateUserDto) {
        try {
            const user = this.userRepository.create(createUserDto);
            await this.userRepository.save(user);
            return user;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async findAll() {
        try {
            return await this.userRepository.find();
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async findByEmail(email: string): Promise<Users | null> {
        return await this.userRepository.findOneBy({ email });
    }

    async findById(id: number) {
        try {
            return await this.userRepository.findOneBy({ id });
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async update(id: number, updateUserDto: UpdateUserDto) {
        try {
            const user = await this.userRepository.findOneBy({ id });
            if (!user) {
                throw new NotFoundException('Usuário não encontrado');
            }
            user.name = updateUserDto.name as string;
            user.email = updateUserDto.email as string;
            user.password = updateUserDto.password as string;

            return await this.userRepository.save(user);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async remove(id: number) {
        try {
            return await this.userRepository.softDelete(id);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}
