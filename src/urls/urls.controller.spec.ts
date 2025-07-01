import { Test, TestingModule } from '@nestjs/testing';
import { UrlController } from './urls.controller';
import { UrlService } from './urls.service';
import { AuthGuard } from '../auth/auth.guard';
import { OptionalAuthGuard } from '../auth/auth.guard.optional';
import { Response } from 'express';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { AuthenticatedRequest } from '../auth/auth.controller';

describe('UrlController', () => {
    let controller: UrlController;
    let urlService: UrlService;

    const mockUrlService = {
        create: jest.fn(),
        findManyByUser: jest.fn(),
        findAndTrackVisitByCode: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    const mockAuthGuard = {
        canActivate: jest.fn(),
    };

    const mockOptionalAuthGuard = {
        canActivate: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UrlController],
            providers: [
                {
                    provide: UrlService,
                    useValue: mockUrlService,
                },
            ],
        })
            .overrideGuard(AuthGuard)
            .useValue(mockAuthGuard)
            .overrideGuard(OptionalAuthGuard)
            .useValue(mockOptionalAuthGuard)
            .compile();

        controller = module.get<UrlController>(UrlController);
        urlService = module.get<UrlService>(UrlService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        const createUrlDto: CreateUrlDto = {
            url: 'https://example.com',
        };

        const mockUser = {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
        };

        const mockRequest = {
            user: mockUser,
        } as AuthenticatedRequest;

        it('should create a URL with authenticated user', async () => {
            const expectedResult = {
                shortUrl: 'http://localhost:3000/abc123',
            };

            mockUrlService.create.mockResolvedValue(expectedResult);

            const result = await controller.create(createUrlDto, mockRequest);

            expect(urlService.create).toHaveBeenCalledWith(
                createUrlDto,
                mockUser.id,
            );
            expect(result).toEqual(expectedResult);
        });

        it('should create a URL without authenticated user', async () => {
            const expectedResult = {
                shortUrl: 'http://localhost:3000/abc123',
            };

            mockUrlService.create.mockResolvedValue(expectedResult);

            const result = await controller.create(createUrlDto, {
                user: undefined,
            } as AuthenticatedRequest);

            expect(urlService.create).toHaveBeenCalledWith(
                createUrlDto,
                undefined,
            );
            expect(result).toEqual(expectedResult);
        });
    });

    describe('findAll', () => {
        const mockUser = {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
        };

        const mockRequest = {
            user: mockUser,
        } as AuthenticatedRequest;

        it('should return all URLs for authenticated user', async () => {
            const expectedUrls = [
                {
                    id: 1,
                    url: 'https://example.com',
                    code: 'abc123',
                    visit_quantity: 5,
                    user: mockUser,
                },
            ];

            mockUrlService.findManyByUser.mockResolvedValue(expectedUrls);

            const result = await controller.findAll(mockRequest);

            expect(urlService.findManyByUser).toHaveBeenCalledWith(
                mockUser.id,
            );
            expect(result).toEqual(expectedUrls);
        });
    });

    describe('redirectAndTrackVisitByCode', () => {
        const mockResponse = {
            redirect: jest.fn(),
        } as unknown as Response;

        it('should redirect to URL and track visit', async () => {
            const code = 'abc123';
            const mockUrl = {
                id: 1,
                url: 'https://example.com',
                code: 'abc123',
                visit_quantity: 5,
            };

            mockUrlService.findAndTrackVisitByCode.mockResolvedValue(mockUrl);

            await controller.redirectAndTrackVisitByCode(code, mockResponse);

            expect(urlService.findAndTrackVisitByCode).toHaveBeenCalledWith(
                code,
            );
            expect(mockResponse.redirect).toHaveBeenCalledWith(mockUrl.url);
        });
    });

    describe('update', () => {
        const updateUrlDto: UpdateUrlDto = {
            url: 'https://updated-example.com',
        };

        const mockUser = {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
        };

        const mockRequest = {
            user: mockUser,
        } as AuthenticatedRequest;

        it('should update URL for authenticated user', async () => {
            const urlId = 1;
            const expectedResult = { affected: 1 };

            mockUrlService.update.mockResolvedValue(expectedResult);

            const result = await controller.update(urlId, updateUrlDto, mockRequest);

            expect(urlService.update).toHaveBeenCalledWith(
                urlId,
                updateUrlDto,
                mockUser.id,
            );
            expect(result).toEqual(expectedResult);
        });
    });

    describe('remove', () => {
        const mockUser = {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
        };

        const mockRequest = {
            user: mockUser,
        } as AuthenticatedRequest;

        it('should remove URL for authenticated user', async () => {
            const urlId = 1;
            const expectedResult = { affected: 1 };

            mockUrlService.remove.mockResolvedValue(expectedResult);

            const result = await controller.remove(urlId, mockRequest);

            expect(urlService.remove).toHaveBeenCalledWith(
                urlId,
                mockUser.id,
            );
            expect(result).toEqual(expectedResult);
        });
    });
});
