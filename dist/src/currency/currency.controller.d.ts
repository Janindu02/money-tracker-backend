import type { JwtPayload } from '../types/auth.types';
import { CurrencyService } from './currency.service';
import { ConvertCurrencyDto, RatesQueryDto } from './dto/convert-currency.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class CurrencyController {
    private currencyService;
    private prisma;
    constructor(currencyService: CurrencyService, prisma: PrismaService);
    getSupported(): {
        base: string;
        currencies: import("./currency.constants").SupportedCurrency[];
    };
    getRates(query: RatesQueryDto): Promise<{
        base: string;
        rates: Record<string, number>;
        updatedAt: string;
    }>;
    convert(dto: ConvertCurrencyDto): Promise<{
        amount: number;
        from: string;
        to: string;
        rate: number;
        converted: number;
    }>;
    getUserCurrencyPreferences(user: JwtPayload): Promise<{
        displayCurrency: string;
        base: string;
        rates: Record<string, number>;
        updatedAt: string;
    }>;
}
