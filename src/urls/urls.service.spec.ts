import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UrlService } from './urls.service';
import { Urls } from './entities/urls.entity';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { 
    InternalServerErrorException, 
    NotFoundException, 
    ForbiddenException 
} from '@nestjs/common';
import { randomBytes } from 'crypto';

jest.mock('crypto', () => ({
    randomBytes: jest.fn(),
}));

describe('UrlService', () => {
    let service: UrlService;
    let urlRepository: Repository<Urls>;

    const mockUrlRepository = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOneBy: jest.fn(),
        update: jest.fn(),
        softDelete: jest.fn(),
    };

    const mockUrl: Urls = {
        id: 1,
        url: 'https://example.com',
        code: 'abc123',
        visit_quantity: 0,
        user: { id: 1 } as any,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null as any,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UrlService,
                {
                    provide: getRepositoryToken(Urls),
                    useValue: mockUrlRepository,
                },
            ],
        }).compile();

        service = module.get<UrlService>(UrlService);
        urlRepository = module.get<Repository<Urls>>(getRepositoryToken(Urls));
        
        (randomBytes as jest.Mock).mockReturnValue({
            toString: jest.fn().mockReturnValue('abc123'),
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        const createUrlDto: CreateUrlDto = {
            url: 'https://example.com',
        };

        it('should create a new URL successfully', async () => {
            const mockCreatedUrl = { ...mockUrl, ...createUrlDto };
            mockUrlRepository.create.mockReturnValue(mockCreatedUrl);
            mockUrlRepository.save.mockResolvedValue(mockCreatedUrl);

            process.env.BASE_URL = 'http://localhost';
            process.env.PORT = '3000';

            const result = await service.create(createUrlDto, 1);

            expect(mockUrlRepository.create).toHaveBeenCalledWith({
                ...createUrlDto,
                code: expect.any(String),
                user: { id: 1 },
            });
            expect(mockUrlRepository.save).toHaveBeenCalledWith(mockCreatedUrl);
            expect(result).toEqual({
                shortUrl: 'http://localhost:3000/abc123',
            });
        });

        it('should create a URL without user ID', async () => {
            const mockCreatedUrl = { ...mockUrl, ...createUrlDto, user: null };
            mockUrlRepository.create.mockReturnValue(mockCreatedUrl);
            mockUrlRepository.save.mockResolvedValue(mockCreatedUrl);

            const result = await service.create(createUrlDto);

            expect(mockUrlRepository.create).toHaveBeenCalledWith({
                ...createUrlDto,
                code: expect.any(String),
                user: { id: undefined },
            });
            expect(result).toBeDefined();
        });

        it('should throw InternalServerErrorException when save fails', async () => {
            mockUrlRepository.create.mockReturnValue(mockUrl);
            mockUrlRepository.save.mockRejectedValue(new Error('Database error'));

            await expect(service.create(createUrlDto, 1)).rejects.toThrow(
                InternalServerErrorException,
            );
        });
    });

    describe('findManyByUser', () => {
        it('should return URLs for a specific user', async () => {
            const userUrls = [mockUrl];
            mockUrlRepository.find.mockResolvedValue(userUrls);

            const result = await service.findManyByUser(1);

            expect(mockUrlRepository.find).toHaveBeenCalledWith({
                where: { user: { id: 1 } },
            });
            expect(result).toEqual(userUrls);
        });

        it('should throw InternalServerErrorException when find fails', async () => {
            mockUrlRepository.find.mockRejectedValue(new Error('Database error'));

            await expect(service.findManyByUser(1)).rejects.toThrow(
                InternalServerErrorException,
            );
        });
    });

    describe('findAll', () => {
        it('should return all URLs', async () => {
            const allUrls = [mockUrl];
            mockUrlRepository.find.mockResolvedValue(allUrls);

            const result = await service.findAll();

            expect(mockUrlRepository.find).toHaveBeenCalled();
            expect(result).toEqual(allUrls);
        });

        it('should throw InternalServerErrorException when find fails', async () => {
            mockUrlRepository.find.mockRejectedValue(new Error('Database error'));

            await expect(service.findAll()).rejects.toThrow(
                InternalServerErrorException,
            );
        });
    });

    describe('findAndTrackVisitByCode', () => {
        it('should find URL by code and increment visit count', async () => {
            const urlWithVisit = { ...mockUrl, visit_quantity: 1 };
            mockUrlRepository.findOneBy.mockResolvedValue(mockUrl);
            mockUrlRepository.save.mockResolvedValue(urlWithVisit);

            const result = await service.findAndTrackVisitByCode('abc123');

            expect(mockUrlRepository.findOneBy).toHaveBeenCalledWith({
                code: 'abc123',
            });
            expect(mockUrlRepository.save).toHaveBeenCalledWith({
                ...mockUrl,
                visit_quantity: 1,
            });
            expect(result).toEqual(urlWithVisit);
        });

        it('should throw NotFoundException when URL not found', async () => {
            mockUrlRepository.findOneBy.mockResolvedValue(null);

            await expect(
                service.findAndTrackVisitByCode('nonexistent'),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw InternalServerErrorException when save fails', async () => {
            mockUrlRepository.findOneBy.mockResolvedValue(mockUrl);
            mockUrlRepository.save.mockRejectedValue(new Error('Database error'));

            await expect(
                service.findAndTrackVisitByCode('abc123'),
            ).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('update', () => {
        const updateUrlDto: UpdateUrlDto = {
            url: 'https://updated-example.com',
        };

        it('should update URL successfully when user is authorized', async () => {
            mockUrlRepository.findOneBy.mockResolvedValue(mockUrl);
            mockUrlRepository.update.mockResolvedValue({ affected: 1 });

            const result = await service.update(1, updateUrlDto, 1);

            expect(mockUrlRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
            expect(mockUrlRepository.update).toHaveBeenCalledWith(1, updateUrlDto);
            expect(result).toEqual({ affected: 1 });
        });

        it('should throw NotFoundException when URL not found', async () => {
            mockUrlRepository.findOneBy.mockResolvedValue(null);

            await expect(service.update(999, updateUrlDto, 1)).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should throw ForbiddenException when user is not authorized', async () => {
            mockUrlRepository.findOneBy.mockResolvedValue(mockUrl);

            await expect(service.update(1, updateUrlDto, 2)).rejects.toThrow(
                ForbiddenException,
            );
        });

        it('should throw InternalServerErrorException when update fails', async () => {
            mockUrlRepository.findOneBy.mockResolvedValue(mockUrl);
            mockUrlRepository.update.mockRejectedValue(new Error('Database error'));

            await expect(service.update(1, updateUrlDto, 1)).rejects.toThrow(
                InternalServerErrorException,
            );
        });
    });

    describe('remove', () => {
        it('should soft delete URL successfully when user is authorized', async () => {
            mockUrlRepository.findOneBy.mockResolvedValue(mockUrl);
            mockUrlRepository.softDelete.mockResolvedValue({ affected: 1 });

            const result = await service.remove(1, 1);

            expect(mockUrlRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
            expect(mockUrlRepository.softDelete).toHaveBeenCalledWith(1);
            expect(result).toEqual({ affected: 1 });
        });

        it('should throw NotFoundException when URL not found', async () => {
            mockUrlRepository.findOneBy.mockResolvedValue(null);

            await expect(service.remove(999, 1)).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should throw ForbiddenException when user is not authorized', async () => {
            mockUrlRepository.findOneBy.mockResolvedValue(mockUrl);

            await expect(service.remove(1, 2)).rejects.toThrow(
                ForbiddenException,
            );
        });

        it('should throw InternalServerErrorException when soft delete fails', async () => {
            mockUrlRepository.findOneBy.mockResolvedValue(mockUrl);
            mockUrlRepository.softDelete.mockRejectedValue(new Error('Database error'));

            await expect(service.remove(1, 1)).rejects.toThrow(
                InternalServerErrorException,
            );
        });
    });
});
