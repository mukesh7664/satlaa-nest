import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CurrencyService } from './currency.service';

@ApiTags('currency')
@Controller('currency')
export class CurrencyController {
    constructor(private readonly currencyService: CurrencyService) { }

    @ApiOperation({ summary: 'Get all supported currencies' })
    @Get('supported')
    async getSupportedCurrencies() {
        return this.currencyService.getSupportedCurrencies();
    }

    @ApiOperation({ summary: 'Get exchange rates for a base currency' })
    @Get('rates')
    async getExchangeRates(@Query('base') base: string = 'INR') {
        return this.currencyService.getExchangeRates(base);
    }
}
