import { HttpService } from '@nestjs/axios';
export declare class CurrencyService {
    private http;
    private readonly logger;
    private cache;
    private readonly cacheTtlMs;
    constructor(http: HttpService);
    getSupported(): {
        base: string;
        currencies: import("./currency.constants").SupportedCurrency[];
    };
    getRates(base?: string): Promise<{
        base: string;
        rates: Record<string, number>;
        updatedAt: string;
    }>;
    convert(amount: number, from: string, to: string): Promise<{
        amount: number;
        from: string;
        to: string;
        rate: number;
        converted: number;
    }>;
    toDisplayCurrency(amount: number, sourceCurrency: string, displayCurrency: string): Promise<number>;
    convertAmountsForUser<T extends {
        amount?: number;
        saved?: number;
        target?: number;
        limit?: number;
        spent?: number;
        value?: number;
        income?: number;
        expenses?: number;
    }>(displayCurrency: string, items: T[], sourceCurrency?: string): Promise<T[]>;
    private getRatesInternal;
    private convertWithRates;
    private fetchRatesFromApi;
    private fetchRatesOpenErApi;
    private fetchSingleRateFallback;
    private validateCurrency;
    private formatRatesResponse;
}
