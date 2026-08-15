import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FeesService } from './fees.service';
import { GetFeesQueryDto } from './dto/get-fees-query.dto';

@ApiTags('Taxas (Fees)')
@Controller('fees')
export class FeesController {
  constructor(private readonly feesService: FeesService) {}

  @Get()
  @ApiOperation({ summary: 'Consulta as taxas de parcelamento para cartão' })
  @ApiResponse({ status: 200, description: 'Lista de parcelas e respectivas taxas retornada com sucesso.' })
  async getFees(@Query() query: GetFeesQueryDto) {
    return this.feesService.listFees(query);
  }
}