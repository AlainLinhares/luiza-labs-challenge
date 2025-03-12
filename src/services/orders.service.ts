import { Injectable } from '@nestjs/common';
import { Order } from '../models/order.model';
import { OrderStorageService } from './order.storage.service';
import { OrderProcessingService } from './order.processing.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly orderStorageService: OrderStorageService,
    private readonly orderProcessingService: OrderProcessingService,
  ) {}

  async processFile(
    lines: string[],
  ): Promise<{ successfulOrders: Order[]; errors: string[] }> {
    const successfulOrders: Order[] = [];
    const errors: string[] = [];
  
    console.log(`Processing ${lines.length} lines...`);

    for (const [index, line] of lines.entries()) {
      try {
        console.log(`Processing line ${index + 1}: "${line}"`);
        const order = await this.orderProcessingService.processString(line);
        successfulOrders.push(order);
        console.log(`Line ${index + 1} processed successfully.`);
      } catch (error) {
        if (error instanceof Error) {
          errors.push(`Linha ${index + 1}: "${line}" - Erro: ${error.message}`);
          console.error(`Error processing line ${index + 1}: ${error.message}`);
        }
      }
    }

    if (successfulOrders.length > 0) {
      console.log(`Storing ${successfulOrders.length} successful orders...`);
      await this.orderStorageService.addOrders(successfulOrders);
      console.log(`Successfully stored ${successfulOrders.length} orders.`);
    }

    console.log('Processing complete.');
    return { successfulOrders, errors };
  }

  async getFilteredOrders(
    orderId?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<Order[]> {
    console.log('Fetching filtered orders...');
    const filteredOrders = await this.orderStorageService.getFilteredOrders(
      orderId,
      startDate,
      endDate,
    );
    console.log(`Found ${filteredOrders.length} filtered orders.`);
    return filteredOrders;
  }
}
