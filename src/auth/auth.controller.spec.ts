import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: AuthService;

    const mockJwtService = {
        signAsync: jest.fn(),
    };

    const mockUsersService = {
        findByEmail: jest.fn(),
        findById: jest.fn(),
    };

    const mockAuthService = {
        signIn: jest.fn(),
        findByUserId: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('signIn', () => {
        it('should return access token when credentials are valid', async () => {
            const signInDto = {
                email: 'test@example.com',
                password: 'password123',
            };

            const expectedResult = {
                access_token: 'mock-jwt-token',
            };

            mockAuthService.signIn.mockResolvedValue(expectedResult);

            const result = await controller.signIn(signInDto);

            expect(authService.signIn).toHaveBeenCalledWith(
                signInDto.email,
                signInDto.password,
            );
            expect(result).toEqual(expectedResult);
        });

        it('should throw UnauthorizedException when credentials are invalid', async () => {
            const signInDto = {
                email: 'test@example.com',
                password: 'wrongpassword',
            };

            mockAuthService.signIn.mockRejectedValue(
                new UnauthorizedException('Usuário não encontrado'),
            );

            await expect(controller.signIn(signInDto)).rejects.toThrow(
                UnauthorizedException,
            );
            expect(authService.signIn).toHaveBeenCalledWith(
                signInDto.email,
                signInDto.password,
            );
        });
    });

    describe('getProfile', () => {
        it('should return user profile when user is authenticated', async () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                name: 'Test User',
            };

            const mockRequest = {
                user: mockUser,
            };

            const expectedResult = {
                id: 1,
                email: 'test@example.com',
                name: 'Test User',
            };

            mockAuthService.findByUserId.mockResolvedValue(expectedResult);

            const result = await controller.getProfile(mockRequest as any);

            expect(authService.findByUserId).toHaveBeenCalledWith(1);
            expect(result).toEqual(expectedResult);
        });
    });
});
