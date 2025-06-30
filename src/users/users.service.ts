import { Injectable } from '@nestjs/common';
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

    async update(id: number, updateUserDto: UpdateUserDto) {
        try {
            return await this.userRepository.update(id, updateUserDto);
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
