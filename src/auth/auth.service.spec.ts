import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
    let service: AuthService;
    let usersService: UsersService;
    let jwtService: JwtService;

    const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword123',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        urls: [],
    };

    const mockUsersService = {
        findByEmail: jest.fn(),
        findById: jest.fn(),
    };

    const mockJwtService = {
        signAsync: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        usersService = module.get<UsersService>(UsersService);
        jwtService = module.get<JwtService>(JwtService);

        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('signIn', () => {
        const email = 'test@example.com';
        const password = 'password123';
        const hashedPassword = 'hashedPassword123';

        it('should be defined', () => {
            expect(service).toBeDefined();
        });

        it('should successfully sign in a user with valid credentials', async () => {
            const expectedToken = 'jwt-token-123';
            const expectedPayload = {
                id: mockUser.id,
                email: mockUser.email,
                name: mockUser.name,
            };

            mockUsersService.findByEmail.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            mockJwtService.signAsync.mockResolvedValue(expectedToken);

            const result = await service.signIn(email, password);

            expect(mockUsersService.findByEmail).toHaveBeenCalledWith(email);
            expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
            expect(mockJwtService.signAsync).toHaveBeenCalledWith(expectedPayload);
            expect(result).toEqual({
                access_token: expectedToken,
            });
        });

        it('should throw UnauthorizedException when password is incorrect', async () => {
            mockUsersService.findByEmail.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(service.signIn(email, password)).rejects.toThrow(
                UnauthorizedException,
            );
            await expect(service.signIn(email, password)).rejects.toThrow(
                'Senha incorreta',
            );

            expect(mockUsersService.findByEmail).toHaveBeenCalledWith(email);
            expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
            expect(mockJwtService.signAsync).not.toHaveBeenCalled();
        });

        it('should handle bcrypt comparison errors gracefully', async () => {
            const bcryptError = new Error('Bcrypt error');
            mockUsersService.findByEmail.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockRejectedValue(bcryptError);

            await expect(service.signIn(email, password)).rejects.toThrow(bcryptError);

            expect(mockUsersService.findByEmail).toHaveBeenCalledWith(email);
            expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
            expect(mockJwtService.signAsync).not.toHaveBeenCalled();
        });

        it('should handle JWT signing errors gracefully', async () => {
            const jwtError = new Error('JWT signing error');
            mockUsersService.findByEmail.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            mockJwtService.signAsync.mockRejectedValue(jwtError);

            await expect(service.signIn(email, password)).rejects.toThrow(jwtError);

            expect(mockUsersService.findByEmail).toHaveBeenCalledWith(email);
            expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
            expect(mockJwtService.signAsync).toHaveBeenCalledWith({
                id: mockUser.id,
                email: mockUser.email,
                name: mockUser.name,
            });
        });

        it('should work with different user data', async () => {
            const differentUser = {
                ...mockUser,
                id: 2,
                name: 'Different User',
                email: 'different@example.com',
                password: 'differentHashedPassword',
            };
            const expectedToken = 'different-jwt-token';

            mockUsersService.findByEmail.mockResolvedValue(differentUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            mockJwtService.signAsync.mockResolvedValue(expectedToken);

            const result = await service.signIn(differentUser.email, password);

            expect(mockUsersService.findByEmail).toHaveBeenCalledWith(differentUser.email);
            expect(bcrypt.compare).toHaveBeenCalledWith(password, differentUser.password);
            expect(mockJwtService.signAsync).toHaveBeenCalledWith({
                id: differentUser.id,
                email: differentUser.email,
                name: differentUser.name,
            });
            expect(result).toEqual({
                access_token: expectedToken,
            });
        });
    });

    describe('findByUserId', () => {
        const userId = 1;

        it('should successfully find user by ID', async () => {
            mockUsersService.findById.mockResolvedValue(mockUser);

            const result = await service.findByUserId(userId);

            expect(mockUsersService.findById).toHaveBeenCalledWith(userId);
            expect(result).toEqual(mockUser);
        });

        it('should handle user not found error from UsersService', async () => {
            const notFoundError = new Error('User not found');
            mockUsersService.findById.mockRejectedValue(notFoundError);

            await expect(service.findByUserId(userId)).rejects.toThrow(notFoundError);

            expect(mockUsersService.findById).toHaveBeenCalledWith(userId);
        });

        it('should work with different user IDs', async () => {
            const differentUserId = 999;
            const differentUser = {
                ...mockUser,
                id: differentUserId,
                name: 'Another User',
                email: 'another@example.com',
            };

            mockUsersService.findById.mockResolvedValue(differentUser);

            const result = await service.findByUserId(differentUserId);

            expect(mockUsersService.findById).toHaveBeenCalledWith(differentUserId);
            expect(result).toEqual(differentUser);
        });

        it('should handle service errors gracefully', async () => {
            const serviceError = new Error('Database connection error');
            mockUsersService.findById.mockRejectedValue(serviceError);

            await expect(service.findByUserId(userId)).rejects.toThrow(serviceError);

            expect(mockUsersService.findById).toHaveBeenCalledWith(userId);
        });
    });

    describe('integration scenarios', () => {
        it('should handle complete authentication flow', async () => {
            const email = 'integration@test.com';
            const password = 'integrationPassword';
            const expectedToken = 'integration-jwt-token';

            mockUsersService.findByEmail.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            mockJwtService.signAsync.mockResolvedValue(expectedToken);

            const signInResult = await service.signIn(email, password);

            expect(signInResult).toEqual({
                access_token: expectedToken,
            });

            mockUsersService.findById.mockResolvedValue(mockUser);
            const findUserResult = await service.findByUserId(mockUser.id);

            expect(findUserResult).toEqual(mockUser);
        });

        it('should handle multiple failed login attempts', async () => {
            const email = 'test@example.com';
            const wrongPassword = 'wrongPassword';

            mockUsersService.findByEmail.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(service.signIn(email, wrongPassword)).rejects.toThrow(
                UnauthorizedException,
            );

            await expect(service.signIn(email, wrongPassword)).rejects.toThrow(
                UnauthorizedException,
            );

            expect(bcrypt.compare).toHaveBeenCalledTimes(2);
            expect(bcrypt.compare).toHaveBeenNthCalledWith(1, wrongPassword, mockUser.password);
            expect(bcrypt.compare).toHaveBeenNthCalledWith(2, wrongPassword, mockUser.password);
        });
    });
});
