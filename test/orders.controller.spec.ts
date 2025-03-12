import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from '../src/controllers/orders.controller';
import { OrdersService } from '../src/services/orders.service';
import { HttpStatus, HttpException } from '@nestjs/common';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  beforeEach(async () => {
    const mockOrdersService = {
      processFile: jest.fn(),
      getFilteredOrders: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);
  });

  describe('uploadFile', () => {
    it('should return success when file is processed successfully', async () => {
      const mockFile = { buffer: Buffer.from('sample file content') } as Express.Multer.File;
      const mockResponse = {
        statusCode: HttpStatus.OK,
        message: 'Arquivo processado com sucesso!',
        data: [],
      };
      (service.processFile as jest.Mock).mockResolvedValue({ successfulOrders: [], errors: [] });
      const result = await controller.uploadFile(mockFile);
      expect(result).toEqual(mockResponse);
    });

    it('should return error when file processing fails', async () => {
      const mockFile = { buffer: Buffer.from('sample file content') } as Express.Multer.File;
      const mockResponse = {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Erro ao processar o arquivo.',
        successfulOrders: [],
        errors: ['error'],
      };
      (service.processFile as jest.Mock).mockResolvedValue({ successfulOrders: [], errors: ['error'] });
      const result = await controller.uploadFile(mockFile);
      expect(result).toEqual(mockResponse);
    });

    it('should throw HttpException when there is an unexpected error', async () => {
      const mockFile = { buffer: Buffer.from('sample file content') } as Express.Multer.File;
      (service.processFile as jest.Mock).mockRejectedValue(new Error('Unexpected error'));
      await expect(controller.uploadFile(mockFile)).rejects.toThrow(HttpException);
    });

    it('should handle empty file', async () => {
      const mockFile = { buffer: Buffer.from('') } as Express.Multer.File;
      await expect(controller.uploadFile(mockFile)).rejects.toThrow(HttpException);
    });

    it('should handle null file input', async () => {
      await expect(controller.uploadFile(null as any)).rejects.toThrow(HttpException);
    });
  });

  describe('getOrders', () => {
    it('should return orders when filters are applied correctly', async () => {
      const mockQuery = { orderId: '1234' };
      const mockOrders = [{ orderId: '1234', userId: '1', value: 100 }];
      (service.getFilteredOrders as jest.Mock).mockResolvedValue(mockOrders);
      const result = await controller.getOrders(mockQuery.orderId);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.data).toEqual(mockOrders);
    });

    it('should return 404 when no orders are found', async () => {
      const mockQuery = { orderId: '1234' };
      (service.getFilteredOrders as jest.Mock).mockResolvedValue([]);
      await expect(controller.getOrders(mockQuery.orderId)).rejects.toThrow(HttpException);
    });

    it('should throw HttpException for unexpected errors', async () => {
      const mockQuery = { orderId: '1234' };
      (service.getFilteredOrders as jest.Mock).mockRejectedValue(new Error('Unexpected error'));
      await expect(controller.getOrders(mockQuery.orderId)).rejects.toThrow(HttpException);
    });

    it('should handle empty query parameters', async () => {
      await expect(controller.getOrders(undefined)).rejects.toThrow(HttpException);
    });

    it('should return orders for valid date range', async () => {
      const mockOrders = [{ orderId: '1234', userId: '1', value: 100 }];
      (service.getFilteredOrders as jest.Mock).mockResolvedValue(mockOrders);
      const result = await controller.getOrders(undefined, '2023-01-01', '2023-12-31');
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.data).toEqual(mockOrders);
    });

    it('should return 400 for invalid date format', async () => {
      await expect(controller.getOrders(undefined, 'invalid-date', '2023-12-31')).rejects.toThrow(HttpException);
    });

    it('should return 400 if start date is after end date', async () => {
      await expect(controller.getOrders(undefined, '2023-12-31', '2023-01-01')).rejects.toThrow(HttpException);
    });
  });
});
