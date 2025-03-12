import { Injectable } from '@nestjs/common';
import { Order } from '../models/order.model';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class OrderStorageService {
  private readonly filePath = path.join(__dirname, '../../data/orders.json');

  private ensureDirectoryExistence(filePath: string): void {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      console.log(`Directory does not exist. Creating directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  async addOrders(orders: Order[]): Promise<void> {
    console.log('Checking if the directory exists...');
    this.ensureDirectoryExistence(this.filePath);

    const fileExists = fs.existsSync(this.filePath);
    console.log(`File ${fileExists ? 'exists' : 'does not exist'}: ${this.filePath}`);

    let existingOrders: Order[] = [];

    if (fileExists) {
      console.log('File found, loading existing data...');
      const fileData = fs.readFileSync(this.filePath, 'utf-8');
      existingOrders = JSON.parse(fileData);
      console.log(`Loaded ${existingOrders.length} existing orders.`);
    }

    orders.forEach((order) => {
      const index = existingOrders.findIndex(
        (o) => o.orderId === order.orderId,
      );
      if (index >= 0) {
        console.log(`Order with orderId ${order.orderId} found, updating.`);
        existingOrders[index] = order;
      } else {
        console.log(`Order with orderId ${order.orderId} not found, adding.`);
        existingOrders.push(order);
      }
    });

    console.log('Saving updated orders to the file...');
    fs.writeFileSync(this.filePath, JSON.stringify(existingOrders, null, 2));
    console.log(`Orders saved successfully to: ${this.filePath}`);
  }

  async getFilteredOrders(
    orderId?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<Order[]> {
    if (!fs.existsSync(this.filePath)) {
      console.log('Orders file not found, returning empty list.');
      return [];
    }

    console.log('File found, loading data...');
    const fileData = fs.readFileSync(this.filePath, 'utf-8');
    let orders: Order[] = JSON.parse(fileData);
    console.log(`Loaded ${orders.length} orders from the file.`);

    if (orderId) {
      console.log(`Filtering orders by orderId: ${orderId}`);
      orders = orders.filter((order) => order.orderId === orderId);
    }
    if (startDate) {
      console.log(`Filtering orders from the start date: ${startDate}`);
      orders = orders.filter((order) => order.date >= startDate);
    }
    if (endDate) {
      console.log(`Filtering orders until the end date: ${endDate}`);
      orders = orders.filter((order) => order.date <= endDate);
    }

    console.log(`Total filtered orders: ${orders.length}`);
    return orders;
  }
}
