import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../decorators/public.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { JwtPayload } from '../types/auth.types';
import { CurrencyService } from './currency.service';
import { ConvertCurrencyDto, RatesQueryDto } from './dto/convert-currency.dto';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('currency')
@Controller('currency')
export class CurrencyController {
  constructor(
    private currencyService: CurrencyService,
    private prisma: PrismaService,
  ) {}

  @Public()
  @Get('supported')
  @ApiOperation({ summary: 'List supported currencies (20 popular incl. LKR, USD)' })
  getSupported() {
    return this.currencyService.getSupported();
  }

  @Public()
  @Get('rates')
  @ApiOperation({ summary: 'Get exchange rates from a base currency' })
  getRates(@Query() query: RatesQueryDto) {
    return this.currencyService.getRates(query.base ?? 'USD');
  }

  @Public()
  @Post('convert')
  @ApiOperation({ summary: 'Convert amount between currencies' })
  convert(@Body() dto: ConvertCurrencyDto) {
    return this.currencyService.convert(dto.amount, dto.from, dto.to);
  }

  @Get('preferences')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user currency + live rates for display' })
  async getUserCurrencyPreferences(@CurrentUser() user: JwtPayload) {
    const profile = await this.prisma.user.findUnique({
      where: { id: user.sub },
      select: { currency: true },
    });
    const displayCurrency = profile?.currency ?? 'LKR';
    const rates = await this.currencyService.getRates('USD');
    return {
      displayCurrency,
      base: rates.base,
      rates: rates.rates,
      updatedAt: rates.updatedAt,
    };
  }
}
