import { Module } from '@nestjs/common';
import { OrdersController } from './controllers/orders.controller';
import { OrdersService } from './services/orders.service';
import { OrderProcessingService } from './services/order.processing.service';
import { OrderStorageService } from './services/order.storage.service';

@Module({
  imports: [],
  controllers: [OrdersController],
  providers: [OrdersService, OrderProcessingService, OrderStorageService],
})
export class AppModule {}
