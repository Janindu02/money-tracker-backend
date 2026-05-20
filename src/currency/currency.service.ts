import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  BASE_CURRENCY,
  SUPPORTED_CURRENCIES,
  SUPPORTED_CURRENCY_CODES,
} from './currency.constants';

interface RatesCache {
  base: string;
  rates: Record<string, number>;
  fetchedAt: number;
}

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);
  private cache: RatesCache | null = null;
  private readonly cacheTtlMs = 60 * 60 * 1000; // 1 hour

  constructor(private http: HttpService) {}

  getSupported() {
    return {
      base: BASE_CURRENCY,
      currencies: SUPPORTED_CURRENCIES,
    };
  }

  async getRates(base = BASE_CURRENCY) {
    if (!SUPPORTED_CURRENCY_CODES.includes(base)) {
      throw new BadRequestException(`Unsupported currency: ${base}`);
    }

    const now = Date.now();
    if (
      this.cache &&
      this.cache.base === base &&
      now - this.cache.fetchedAt < this.cacheTtlMs
    ) {
      return this.formatRatesResponse(this.cache);
    }

    const rates = await this.fetchRatesFromApi(base);
    this.cache = { base, rates, fetchedAt: now };
    return this.formatRatesResponse(this.cache);
  }

  async convert(amount: number, from: string, to: string) {
    if (from === to) {
      return { amount, from, to, rate: 1, converted: amount };
    }

    this.validateCurrency(from);
    this.validateCurrency(to);

    const { rates, base } = await this.getRatesInternal(from);
    const converted = this.convertWithRates(amount, from, to, base, rates);

    return {
      amount,
      from,
      to,
      rate: converted / amount,
      converted: Math.round(converted * 100) / 100,
    };
  }

  /** Convert amount from source currency into user's display currency */
  async toDisplayCurrency(
    amount: number,
    sourceCurrency: string,
    displayCurrency: string,
  ): Promise<number> {
    if (sourceCurrency === displayCurrency) return amount;
    try {
      const result = await this.convert(amount, sourceCurrency, displayCurrency);
      return result.converted;
    } catch (err) {
      this.logger.warn(
        `Currency conversion failed ${sourceCurrency}->${displayCurrency}, using raw amount`,
        err,
      );
      return amount;
    }
  }

  async convertAmountsForUser<T extends { amount?: number; saved?: number; target?: number; limit?: number; spent?: number; value?: number; income?: number; expenses?: number }>(
    displayCurrency: string,
    items: T[],
    sourceCurrency = BASE_CURRENCY,
  ): Promise<T[]> {
    const { rates, base } = await this.getRatesInternal(BASE_CURRENCY);
    return items.map((item) => {
      const converted = { ...item };
      const fields = ['amount', 'saved', 'target', 'limit', 'spent', 'value', 'income', 'expenses'] as const;
      for (const field of fields) {
        if (typeof item[field] === 'number') {
          (converted as Record<string, number>)[field] = this.convertWithRates(
            item[field]!,
            sourceCurrency,
            displayCurrency,
            base,
            rates,
          );
        }
      }
      return converted;
    });
  }

  private async getRatesInternal(preferredBase = BASE_CURRENCY) {
    const data = await this.getRates(preferredBase);
    return { base: data.base, rates: data.rates as Record<string, number> };
  }

  private convertWithRates(
    amount: number,
    from: string,
    to: string,
    base: string,
    rates: Record<string, number>,
  ): number {
    if (from === to) return amount;

    let inBase: number;
    if (from === base) {
      inBase = amount;
    } else {
      const fromRate = rates[from];
      if (!fromRate) throw new BadRequestException(`No rate for ${from}`);
      inBase = amount / fromRate;
    }

    if (to === base) return Math.round(inBase * 100) / 100;

    const toRate = rates[to];
    if (!toRate) throw new BadRequestException(`No rate for ${to}`);
    return Math.round(inBase * toRate * 100) / 100;
  }

  private async fetchRatesFromApi(base: string): Promise<Record<string, number>> {
    // Frankfurter — free, no API key (ECB rates)
    try {
      const url = `https://api.frankfurter.app/latest?from=${base}`;
      const res = await firstValueFrom(this.http.get<{ rates: Record<string, number> }>(url));
      const rates: Record<string, number> = { [base]: 1, ...res.data.rates };

      for (const code of SUPPORTED_CURRENCY_CODES) {
        if (!rates[code] && code !== base) {
          rates[code] = await this.fetchSingleRateFallback(base, code);
        }
      }
      return rates;
    } catch (err) {
      this.logger.warn('Frankfurter API failed, using open.er-api.com fallback', err);
      return this.fetchRatesOpenErApi(base);
    }
  }

  private async fetchRatesOpenErApi(base: string): Promise<Record<string, number>> {
    const url = `https://open.er-api.com/v6/latest/${base}`;
    const res = await firstValueFrom(
      this.http.get<{ rates: Record<string, number>; result: string }>(url),
    );
    if (res.data.result !== 'success') {
      throw new BadRequestException('Unable to fetch exchange rates');
    }
    return { [base]: 1, ...res.data.rates };
  }

  private async fetchSingleRateFallback(from: string, to: string): Promise<number> {
    try {
      const url = `https://open.er-api.com/v6/pair/${from}/${to}`;
      const res = await firstValueFrom(this.http.get<{ conversion_rate: number }>(url));
      return res.data.conversion_rate;
    } catch {
      this.logger.error(`Failed to fetch rate ${from}->${to}`);
      return 1;
    }
  }

  private validateCurrency(code: string) {
    if (!SUPPORTED_CURRENCY_CODES.includes(code)) {
      throw new BadRequestException(`Unsupported currency: ${code}`);
    }
  }

  private formatRatesResponse(cache: RatesCache) {
    const filtered: Record<string, number> = {};
    for (const code of SUPPORTED_CURRENCY_CODES) {
      if (cache.rates[code] !== undefined) {
        filtered[code] = cache.rates[code];
      }
    }
    return {
      base: cache.base,
      rates: filtered,
      updatedAt: new Date(cache.fetchedAt).toISOString(),
    };
  }
}
