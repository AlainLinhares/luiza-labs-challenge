import {
  Controller,
  Post,
  Get,
  Query,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { OrdersService } from '../services/orders.service';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Endpoint para fazer o upload do arquivo de pedidos.
   * @param file Arquivo de pedidos a ser processado.
   * @returns Mensagem de sucesso ou erro
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Fazer upload de um arquivo de pedidos' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description:
      'Arquivo de pedidos a ser processado. O arquivo deve ser no formato txt com os dados no exemplo abaixo.',
    examples: {
      'application/txt': {
        value: `0000000088                             Terra Daniel DDS00000008360000000003     1899.0220210909
0000000103                                 Gail Bradtke00000009660000000005     1564.2120210507
0000000083                          Frances Satterfield00000007910000000006      224.7520211122
0000000141                                  Lloyd Mante00000013040000000001     1760.0120211012
0000000177                            Dr. Patrina Frami00000016320000000002     1045.1320210310
0000000136                           Miss Freida Rippin00000012620000000002       36.8920211108`,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'Arquivo processado com sucesso. Retorna os pedidos normalizados.',
    schema: {
      example: {
        statusCode: 200,
        message: 'Arquivo processado com sucesso!',
        data: [
          {
            userId: '88',
            userName: 'Terra Daniel DDS',
            orderId: '836',
            prodId: 3,
            value: 1899.02,
            date: '2021-09-09',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Erro ao processar o arquivo. Retorna erros de formatação nas linhas.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Erro ao processar o arquivo.',
        successfulOrders: [
          {
            userId: '88',
            userName: 'Terra Daniel DDS',
            orderId: '836',
            prodId: 3,
            value: 1899.02,
            date: '2021-09-09',
          },
        ],
        errors: [
          'Linha 18: "0000000065                                 Jovan Deckow00000006230000000000     1068.1320210530" - Erro: Formato de linha inválido',
          'Linha 43: "0000000085                                Laverna Nolan00000008130000000000     1195.9620210411" - Erro: Formato de linha inválido',
        ],
      },
    },
  })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    try {
      const lines = file.buffer
        .toString()
        .split('\n')
        .filter((line) => line.trim() !== '');

      const { successfulOrders, errors } =
        await this.ordersService.processFile(lines);

      if (errors.length > 0) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Erro ao processar o arquivo.',
          successfulOrders,
          errors,
        };
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Arquivo processado com sucesso!',
        data: successfulOrders,
      };
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw new HttpException(
          `Erro ao processar o arquivo: ${error.message}`,
          error.getStatus(),
        );
      } else if (error instanceof Error) {
        throw new HttpException(
          `Erro desconhecido ao processar o arquivo: ${error.message}`,
          HttpStatus.BAD_REQUEST,
        );
      } else {
        throw new HttpException(
          'Erro desconhecido ao processar o arquivo.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  /**
   * Endpoint para listar os pedidos com filtros.
   * @param orderId ID do pedido
   * @param startDate Data de início do filtro
   * @param endDate Data de fim do filtro
   * @returns Lista de pedidos
   */
  @Get('list')
  @ApiOperation({ summary: 'Listar pedidos com filtros' })
  @ApiQuery({
    name: 'orderId',
    required: false,
    type: String,
    description: 'ID do pedido',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Data de início do filtro (formato: yyyy-mm-dd)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Data de fim do filtro (formato: yyyy-mm-dd)',
  })
  @ApiResponse({
    status: 200,
    description: 'Pedidos encontrados',
    schema: {
      example: {
        statusCode: 200,
        message: 'Pedidos encontrados',
        data: [
          {
            userId: '177',
            userName: 'Dr. Patrina Frami',
            orderId: '1632',
            prodId: 1,
            value: 1153.25,
            date: '2021-03-10',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Nenhum pedido encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Nenhum pedido encontrado',
      },
    },
  })
  async getOrders(
    @Query('orderId') orderId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const orders = await this.ordersService.getFilteredOrders(
        orderId,
        startDate,
        endDate,
      );

      if (orders.length === 0) {
        throw new HttpException(
          'Nenhum pedido encontrado',
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Pedidos encontrados',
        data: orders,
      };
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw new HttpException(error.message, error.getStatus());
      } else if (error instanceof Error) {
        throw new HttpException(
          `Erro desconhecido ao buscar os pedidos: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        throw new HttpException(
          'Erro desconhecido ao buscar os pedidos.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
