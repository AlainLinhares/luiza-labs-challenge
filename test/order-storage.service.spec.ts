import { Test, TestingModule } from '@nestjs/testing';
import { OrderStorageService } from '../src/services/order.storage.service';
import { Order } from '../src/models/order.model';
import * as fs from 'fs';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

describe('OrderStorageService', () => {
  let service: OrderStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderStorageService],
    }).compile();

    service = module.get<OrderStorageService>(OrderStorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should add orders and write them to file', async () => {
    const mockOrders: Order[] = [
      new Order('1', 'John Doe', 'order1', 10, 100, '2021-01-01'),
    ];

    (fs.existsSync as jest.Mock).mockReturnValue(false);

    const mkdirSyncSpy = jest
      .spyOn(fs, 'mkdirSync')
      .mockImplementation(() => undefined);

    const writeFileSyncSpy = jest
      .spyOn(fs, 'writeFileSync')
      .mockImplementation(() => {});

    await service.addOrders(mockOrders);

    expect(mkdirSyncSpy).toHaveBeenCalled();
    expect(writeFileSyncSpy).toHaveBeenCalledWith(
      expect.any(String),
      JSON.stringify(mockOrders, null, 2),
    );
  });

  it('should update an existing order in the file', async () => {
    const mockOrders: Order[] = [
      new Order('1', 'John Doe', 'order1', 10, 100, '2021-01-01'),
    ];

    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(
      JSON.stringify([
        new Order('1', 'John Doe', 'order1', 10, 100, '2021-01-01'),
      ]),
    );

    const writeFileSyncSpy = jest
      .spyOn(fs, 'writeFileSync')
      .mockImplementation(() => {});

    await service.addOrders(mockOrders);

    expect(writeFileSyncSpy).toHaveBeenCalledWith(
      expect.any(String),
      JSON.stringify(mockOrders, null, 2),
    );
  });

  it('should filter orders by orderId', async () => {
    const mockOrders: Order[] = [
      new Order('1', 'John Doe', 'order1', 10, 100, '2021-01-01'),
      new Order('2', 'Jane Doe', 'order2', 20, 200, '2021-02-01'),
    ];

    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockOrders));

    const orders = await service.getFilteredOrders('order1');

    expect(orders).toHaveLength(1);
    expect(orders[0].orderId).toBe('order1');
  });

  it('should filter orders by startDate', async () => {
    const mockOrders: Order[] = [
      new Order('1', 'John Doe', 'order1', 10, 100, '2021-01-01'),
      new Order('2', 'Jane Doe', 'order2', 20, 200, '2021-02-01'),
    ];

    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockOrders));

    const orders = await service.getFilteredOrders(undefined, '2021-01-15');

    expect(orders).toHaveLength(1);
    expect(orders[0].orderId).toBe('order2');
  });

  it('should filter orders by endDate', async () => {
    const mockOrders: Order[] = [
      new Order('1', 'John Doe', 'order1', 10, 100, '2021-01-01'),
      new Order('2', 'Jane Doe', 'order2', 20, 200, '2021-02-01'),
    ];

    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockOrders));

    const orders = await service.getFilteredOrders(
      undefined,
      undefined,
      '2021-01-31',
    );

    expect(orders).toHaveLength(1);
    expect(orders[0].orderId).toBe('order1');
  });

  it('should call mkdirSync when adding orders', async () => {
    const mockOrders: Order[] = [
      new Order('1', 'John Doe', 'order1', 10, 100, '2021-01-01'),
    ];

    (fs.existsSync as jest.Mock).mockReturnValue(false);

    const mkdirSyncSpy = jest
      .spyOn(fs, 'mkdirSync')
      .mockImplementation(() => undefined);

    const writeFileSyncSpy = jest
      .spyOn(fs, 'writeFileSync')
      .mockImplementation(() => {});

    await service.addOrders(mockOrders);

    expect(mkdirSyncSpy).toHaveBeenCalled();
  });
});
