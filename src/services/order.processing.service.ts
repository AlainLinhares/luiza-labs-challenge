import { Injectable } from '@nestjs/common';
import { Order } from '../models/order.model';

@Injectable()
export class OrderProcessingService {
  processString(input: string): Order {
    input = input.trim();
    console.log('Input after trimming:', input);

    const userId = input.substring(0, 10).replace(/^0+/, '').trim();
    const userName = input.substring(10, 55).trim();
    const orderId = input.substring(55, 65).replace(/^0+/, '').trim();
    const prodId = /^0{10}$/.test(input.substring(65, 75).trim())
      ? '0'
      : input.substring(65, 75).replace(/^0+/, '').trim();
    const value = input.substring(75, 87).trim();
    const date = input.substring(87, 95).trim();

    if (
      ![userId, userName, orderId, prodId, value, date].every(
        (field) => field.length > 0,
      ) ||
      prodId === '0'
    ) {
      console.error('Invalid input format:', {
        userId,
        userName,
        orderId,
        prodId,
        value,
        date,
      });
      throw new Error('Formato de linha inválido');
    }

    console.log('Creating new Order with the extracted values');
    return new Order(
      userId,
      userName,
      orderId,
      Number(prodId),
      parseFloat(this.formatDecimal(value)),
      this.formatDate(date),
    );
  }

  private formatDecimal(value: string): string {
    console.log('Formatting value for decimal:', value);
    return value.replace(',', '.');
  }

  private formatDate(date: string): string {
    console.log('Formatting date:', date);
    if (date.length !== 8) {
      console.error('Invalid date format:', date);
      throw new Error('Formato de data inválido');
    }
    return `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`;
  }
}
