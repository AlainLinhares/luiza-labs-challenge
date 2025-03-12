import { Test, TestingModule } from '@nestjs/testing';
import { OrderProcessingService } from '../src/services/order.processing.service';
import { Order } from '../src/models/order.model';

describe('OrderProcessingService', () => {
  let service: OrderProcessingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderProcessingService],
    }).compile();

    service = module.get<OrderProcessingService>(OrderProcessingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should successfully process a valid string input', async () => {
    const input =
      '0000000083                          Frances Satterfield00000007910000000006      224.7520211122';
    const result = await service.processString(input);
    expect(result).toBeInstanceOf(Order);
    expect(result.userId).toBe('83');
    expect(result.userName).toBe('Frances Satterfield');
    expect(result.orderId).toBe('791');
    expect(result.prodId).toBe(6);
    expect(result.value).toBe(224.75);
    expect(result.date).toBe('2021-11-22');
  });

  it('should successfully process another valid string input', async () => {
    const input =
      '0000000141                                  Lloyd Mante00000013040000000001     1760.0120211012';
    const result = await service.processString(input);
    expect(result).toBeInstanceOf(Order);
    expect(result.userId).toBe('141');
    expect(result.userName).toBe('Lloyd Mante');
    expect(result.orderId).toBe('1304');
    expect(result.prodId).toBe(1);
    expect(result.value).toBe(1760.01);
    expect(result.date).toBe('2021-10-12');
  });

  it('should successfully process another valid string input', async () => {
    const input =
      '0000000177                            Dr. Patrina Frami00000016320000000002     1045.1320210310';
    const result = await service.processString(input);
    expect(result).toBeInstanceOf(Order);
    expect(result.userId).toBe('177');
    expect(result.userName).toBe('Dr. Patrina Frami');
    expect(result.orderId).toBe('1632');
    expect(result.prodId).toBe(2);
    expect(result.value).toBe(1045.13);
    expect(result.date).toBe('2021-03-10');
  });

  it('should successfully process another valid string input', async () => {
    const input =
      '0000000136                           Miss Freida Rippin00000012620000000002       36.8920211108';
    const result = await service.processString(input);
    expect(result).toBeInstanceOf(Order);
    expect(result.userId).toBe('136');
    expect(result.userName).toBe('Miss Freida Rippin');
    expect(result.orderId).toBe('1262');
    expect(result.prodId).toBe(2);
    expect(result.value).toBe(36.89);
    expect(result.date).toBe('2021-11-08');
  });

  it('should throw error if userId is missing', () => {
    const input =
      '                                              Frances Satterfield00000007910000000006      224.7520211122';
    expect(() => service.processString(input)).toThrow(
      'Formato de linha inválido',
    );
  });

  it('should throw error if userName is missing', () => {
    const input =
      '0000000083                          00000007910000000006      224.7520211122';

    try {
      service.processString(input);
    } catch (error) {
      if (error instanceof Error) {
        expect(error.message).toBe('Formato de linha inválido');
      } else {
        throw new Error('Erro inesperado');
      }
    }
  });

  it('should throw error if orderId is missing', () => {
    const input =
      '0000000083                          Frances Satterfield000000000000000006      224.7520211122';
    expect(() => service.processString(input)).toThrow(
      'Formato de linha inválido',
    );
  });

  it('should throw error if value is missing', () => {
    const input =
      '0000000083                          Frances Satterfield00000007910000000006              20211122';
    expect(() => service.processString(input)).toThrow(
      'Formato de linha inválido',
    );
  });

  it('should correctly format decimal values', () => {
    const value = '1234,56';
    const result = service['formatDecimal'](value);
    expect(result).toBe('1234.56');
  });

  it('should correctly handle decimal values without comma', () => {
    const value = '1234.56';
    const result = service['formatDecimal'](value);
    expect(result).toBe('1234.56');
  });

  it('should correctly format date values', () => {
    const date = '20210310';
    const result = service['formatDate'](date);
    expect(result).toBe('2021-03-10');
  });

  it('should throw error for invalid date format', () => {
    const date = '202103';
    expect(() => service['formatDate'](date)).toThrow(
      'Formato de data inválido',
    );
  });
});
