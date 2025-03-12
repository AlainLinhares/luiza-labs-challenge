import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from '../src/services/orders.service';
import { OrderStorageService } from '../src/services/order.storage.service';
import { OrderProcessingService } from '../src/services/order.processing.service';
import { Order } from '../src/models/order.model';

describe('OrdersService', () => {
  let service: OrdersService;
  let orderStorageService: OrderStorageService;
  let orderProcessingService: OrderProcessingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: OrderStorageService,
          useValue: {
            addOrders: jest.fn(),
            getFilteredOrders: jest.fn(),
          },
        },
        {
          provide: OrderProcessingService,
          useValue: {
            processString: jest.fn() as jest.MockedFunction<
              (line: string) => Promise<Order>
            >,
          },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    orderStorageService = module.get<OrderStorageService>(OrderStorageService);
    orderProcessingService = module.get<OrderProcessingService>(
      OrderProcessingService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should process a valid line and return a successful order', async () => {
    const line =
      '0000000083 Frances Satterfield00000007910000000006 224.7520211122';
    const order = new Order(
      '0000000083',
      'Frances Satterfield',
      '0000000791',
      6,
      224.75,
      '2021-11-22',
    );

    jest.spyOn(orderProcessingService, 'processString').mockReturnValue(order);

    const result = await service.processFile([line]);

    expect(result.successfulOrders).toHaveLength(1);
    expect(result.errors).toHaveLength(0);
    expect(result.successfulOrders[0]).toEqual(order);
  });

  it('should return errors when there is an invalid line format', async () => {
    const line = 'invalid line';

    (orderProcessingService.processString as jest.Mock).mockRejectedValue(
      new Error('Formato de linha inválido'),
    );

    const result = await service.processFile([line]);

    expect(result.successfulOrders).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('Erro: Formato de linha inválido');
  });

  it('should process multiple valid lines and return successful orders', async () => {
    const lines = [
      '0000000083 Frances Satterfield00000007910000000006 224.7520211122',
      '0000000141 Lloyd Mante00000013040000000001 1760.0120211012',
    ];

    const orders = [
      new Order(
        '0000000083',
        'Frances Satterfield',
        '0000000791',
        6,
        224.75,
        '2021-11-22',
      ),
      new Order(
        '0000000141',
        'Lloyd Mante',
        '0000001304',
        1,
        1760.01,
        '2021-10-12',
      ),
    ];

    jest
      .spyOn(orderProcessingService, 'processString')
      .mockReturnValue(orders[0])
      .mockReturnValue(orders[1]);

    const result = await service.processFile(lines);

    expect(result.successfulOrders).toHaveLength(2);
    expect(result.errors).toHaveLength(0);
  });

  it('should return errors for multiple invalid lines', async () => {
    const lines = ['invalid line', 'another invalid line'];

    (orderProcessingService.processString as jest.Mock)
      .mockRejectedValueOnce(new Error('Formato de linha inválido'))
      .mockRejectedValueOnce(new Error('Formato de linha inválido'));

    const result = await service.processFile(lines);

    expect(result.successfulOrders).toHaveLength(0);
    expect(result.errors).toHaveLength(2);
  });

  it('should return no errors and no successful orders when input is empty', async () => {
    const result = await service.processFile([]);

    expect(result.successfulOrders).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  });

  it('should call getFilteredOrders with no filters', async () => {
    const orders = [new Order('1', 'User 1', 'prod1', 1, 100, '2022-01-01')];
    jest
      .spyOn(orderStorageService, 'getFilteredOrders')
      .mockResolvedValue(orders);

    const result = await service.getFilteredOrders();

    expect(result).toEqual(orders);
    expect(orderStorageService.getFilteredOrders).toHaveBeenCalledWith(
      undefined,
      undefined,
      undefined,
    );
  });

  it('should filter orders by orderId', async () => {
    const order = new Order('1', 'User 1', 'prod1', 1, 100, '2022-01-01');
    jest
      .spyOn(orderStorageService, 'getFilteredOrders')
      .mockResolvedValue([order]);

    const result = await service.getFilteredOrders('1');

    expect(result).toEqual([order]);
    expect(orderStorageService.getFilteredOrders).toHaveBeenCalledWith(
      '1',
      undefined,
      undefined,
    );
  });

  it('should filter orders by startDate', async () => {
    const order = new Order('1', 'User 1', 'prod1', 1, 100, '2022-01-01');
    jest
      .spyOn(orderStorageService, 'getFilteredOrders')
      .mockResolvedValue([order]);

    const result = await service.getFilteredOrders(undefined, '2022-01-01');

    expect(result).toEqual([order]);
    expect(orderStorageService.getFilteredOrders).toHaveBeenCalledWith(
      undefined,
      '2022-01-01',
      undefined,
    );
  });

  it('should filter orders by endDate', async () => {
    const order = new Order('1', 'User 1', 'prod1', 1, 100, '2022-01-01');
    jest
      .spyOn(orderStorageService, 'getFilteredOrders')
      .mockResolvedValue([order]);

    const result = await service.getFilteredOrders(
      undefined,
      undefined,
      '2022-01-01',
    );

    expect(result).toEqual([order]);
    expect(orderStorageService.getFilteredOrders).toHaveBeenCalledWith(
      undefined,
      undefined,
      '2022-01-01',
    );
  });

  it('should call addOrders with successful orders', async () => {
    const orders = [new Order('1', 'User 1', 'prod1', 1, 100, '2022-01-01')];

    jest
      .spyOn(orderProcessingService, 'processString')
      .mockReturnValue(orders[0]);

    const addOrdersMock = jest.fn().mockResolvedValue(undefined);
    orderStorageService.addOrders = addOrdersMock;

    const result = await service.processFile(['valid line']);

    expect(addOrdersMock).toHaveBeenCalledWith(orders);
    expect(result.successfulOrders).toEqual(orders);
    expect(result.errors).toHaveLength(0);
  });
});
