import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { Users } from './entities/users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
    NotFoundException,
    ConflictException,
    InternalServerErrorException,
} from '@nestjs/common';

describe('UsersService', () => {
    let service: UsersService;

    const mockRepository = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOneBy: jest.fn(),
        softDelete: jest.fn(),
    };

    const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword123',
        urls: [],
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null as Date | null,
        hashPassword: jest.fn(),
    } as Users;

    const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPass123!',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(Users),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);

        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new user successfully', async () => {
            const createdUser = { ...mockUser };
            mockRepository.findOneBy.mockResolvedValue(null);
            mockRepository.create.mockReturnValue(createdUser);
            mockRepository.save.mockResolvedValue(createdUser);

            const result = await service.create(createUserDto);

            expect(mockRepository.findOneBy).toHaveBeenCalledWith({
                email: createUserDto.email,
            });
            expect(mockRepository.create).toHaveBeenCalledWith(createUserDto);
            expect(mockRepository.save).toHaveBeenCalledWith(createdUser);
            expect(result).toEqual(createdUser);
        });

        it('should throw ConflictException when user with email already exists', async () => {
            mockRepository.findOneBy.mockResolvedValue(mockUser);

            await expect(service.create(createUserDto)).rejects.toThrow(
                ConflictException,
            );
            expect(mockRepository.findOneBy).toHaveBeenCalledWith({
                email: createUserDto.email,
            });
            expect(mockRepository.create).not.toHaveBeenCalled();
        });

        it('should throw InternalServerErrorException when database error occurs', async () => {
            mockRepository.findOneBy.mockResolvedValue(null);
            mockRepository.create.mockReturnValue(mockUser);
            mockRepository.save.mockRejectedValue(new Error('Database error'));

            await expect(service.create(createUserDto)).rejects.toThrow(
                InternalServerErrorException,
            );
        });
    });

    describe('findAll', () => {
        it('should return all users without passwords', async () => {
            const users = [
                { ...mockUser },
                { ...mockUser, id: 2, email: 'test2@example.com' },
            ];
            mockRepository.find.mockResolvedValue(users);

            const result = await service.findAll();

            expect(result).toEqual(users);
        });

        it('should throw InternalServerErrorException when database error occurs', async () => {
            mockRepository.find.mockRejectedValue(new Error('Database error'));

            await expect(service.findAll()).rejects.toThrow(
                InternalServerErrorException,
            );
        });
    });

    describe('findByEmail', () => {
        it('should return user when found by email', async () => {
            mockRepository.findOneBy.mockResolvedValue(mockUser);

            const result = await service.findByEmail('test@example.com');

            expect(mockRepository.findOneBy).toHaveBeenCalledWith({
                email: 'test@example.com',
            });
            expect(result).toEqual(mockUser);
        });

        it('should return null when user not found by email', async () => {
            mockRepository.findOneBy.mockResolvedValue(null);

            const result = await service.findByEmail('nonexistent@example.com');

            expect(mockRepository.findOneBy).toHaveBeenCalledWith({
                email: 'nonexistent@example.com',
            });
            expect(result).toBeNull();
        });

        it('should throw InternalServerErrorException when database error occurs', async () => {
            mockRepository.findOneBy.mockRejectedValue(
                new Error('Database error'),
            );

            await expect(
                service.findByEmail('test@example.com'),
            ).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('findById', () => {
        it('should return user when found by id', async () => {
            mockRepository.findOneBy.mockResolvedValue(mockUser);

            const result = await service.findById(1);

            expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
            expect(result).toEqual(mockUser);
        });

        it('should throw NotFoundException when user not found by id', async () => {
            mockRepository.findOneBy.mockResolvedValue(null);

            await expect(service.findById(999)).rejects.toThrow(
                NotFoundException,
            );
            expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 999 });
        });

        it('should throw InternalServerErrorException when database error occurs', async () => {
            mockRepository.findOneBy.mockRejectedValue(
                new Error('Database error'),
            );

            await expect(service.findById(1)).rejects.toThrow(
                InternalServerErrorException,
            );
        });
    });

    describe('update', () => {
        const updateUserDto: UpdateUserDto = {
            name: 'Updated User',
            email: 'updated@example.com',
        };

        it('should update user successfully', async () => {
            const updatedUser = { ...mockUser, ...updateUserDto };
            mockRepository.findOneBy
                .mockResolvedValueOnce(mockUser)
                .mockResolvedValueOnce(null);
            mockRepository.save.mockResolvedValue(updatedUser);

            const result = await service.update(1, updateUserDto);

            expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
            expect(mockRepository.save).toHaveBeenCalledWith(updatedUser);
            expect(result).toEqual(updatedUser);
        });

        it('should throw NotFoundException when user not found', async () => {
            mockRepository.findOneBy.mockResolvedValue(null);

            await expect(service.update(999, updateUserDto)).rejects.toThrow(
                NotFoundException,
            );
            expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 999 });
            expect(mockRepository.save).not.toHaveBeenCalled();
        });

        it('should not check email uniqueness when email is not being updated', async () => {
            const updateDtoWithoutEmail: UpdateUserDto = {
                name: 'Updated User',
            };
            const updatedUser = { ...mockUser, name: 'Updated User' };

            jest.clearAllMocks();
            mockRepository.findOneBy.mockResolvedValue(mockUser);
            mockRepository.save.mockResolvedValue(updatedUser);

            const result = await service.update(1, updateDtoWithoutEmail);

            expect(mockRepository.findOneBy).toHaveBeenCalledTimes(1);
            expect(mockRepository.save).toHaveBeenCalledWith(updatedUser);
            expect(result).toEqual(updatedUser);
        });

        it('should throw InternalServerErrorException when database error occurs', async () => {
            mockRepository.findOneBy.mockResolvedValue(mockUser);
            mockRepository.save.mockRejectedValue(new Error('Database error'));

            await expect(service.update(1, updateUserDto)).rejects.toThrow(
                InternalServerErrorException,
            );
        });
    });

    describe('remove', () => {
        it('should remove user successfully', async () => {
            mockRepository.softDelete.mockResolvedValue({ affected: 1 });

            await service.remove(1);

            expect(mockRepository.softDelete).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException when user not found for deletion', async () => {
            mockRepository.softDelete.mockResolvedValue({ affected: 0 });

            await expect(service.remove(999)).rejects.toThrow(
                NotFoundException,
            );
            expect(mockRepository.softDelete).toHaveBeenCalledWith(999);
        });

        it('should throw InternalServerErrorException when database error occurs', async () => {
            mockRepository.softDelete.mockRejectedValue(
                new Error('Database error'),
            );

            await expect(service.remove(1)).rejects.toThrow(
                InternalServerErrorException,
            );
        });
    });
});
