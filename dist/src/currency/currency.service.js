"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CurrencyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const currency_constants_1 = require("./currency.constants");
let CurrencyService = CurrencyService_1 = class CurrencyService {
    http;
    logger = new common_1.Logger(CurrencyService_1.name);
    cache = null;
    cacheTtlMs = 60 * 60 * 1000;
    constructor(http) {
        this.http = http;
    }
    getSupported() {
        return {
            base: currency_constants_1.BASE_CURRENCY,
            currencies: currency_constants_1.SUPPORTED_CURRENCIES,
        };
    }
    async getRates(base = currency_constants_1.BASE_CURRENCY) {
        if (!currency_constants_1.SUPPORTED_CURRENCY_CODES.includes(base)) {
            throw new common_1.BadRequestException(`Unsupported currency: ${base}`);
        }
        const now = Date.now();
        if (this.cache &&
            this.cache.base === base &&
            now - this.cache.fetchedAt < this.cacheTtlMs) {
            return this.formatRatesResponse(this.cache);
        }
        const rates = await this.fetchRatesFromApi(base);
        this.cache = { base, rates, fetchedAt: now };
        return this.formatRatesResponse(this.cache);
    }
    async convert(amount, from, to) {
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
    async toDisplayCurrency(amount, sourceCurrency, displayCurrency) {
        if (sourceCurrency === displayCurrency)
            return amount;
        try {
            const result = await this.convert(amount, sourceCurrency, displayCurrency);
            return result.converted;
        }
        catch (err) {
            this.logger.warn(`Currency conversion failed ${sourceCurrency}->${displayCurrency}, using raw amount`, err);
            return amount;
        }
    }
    async convertAmountsForUser(displayCurrency, items, sourceCurrency = currency_constants_1.BASE_CURRENCY) {
        const { rates, base } = await this.getRatesInternal(currency_constants_1.BASE_CURRENCY);
        return items.map((item) => {
            const converted = { ...item };
            const fields = ['amount', 'saved', 'target', 'limit', 'spent', 'value', 'income', 'expenses'];
            for (const field of fields) {
                if (typeof item[field] === 'number') {
                    converted[field] = this.convertWithRates(item[field], sourceCurrency, displayCurrency, base, rates);
                }
            }
            return converted;
        });
    }
    async getRatesInternal(preferredBase = currency_constants_1.BASE_CURRENCY) {
        const data = await this.getRates(preferredBase);
        return { base: data.base, rates: data.rates };
    }
    convertWithRates(amount, from, to, base, rates) {
        if (from === to)
            return amount;
        let inBase;
        if (from === base) {
            inBase = amount;
        }
        else {
            const fromRate = rates[from];
            if (!fromRate)
                throw new common_1.BadRequestException(`No rate for ${from}`);
            inBase = amount / fromRate;
        }
        if (to === base)
            return Math.round(inBase * 100) / 100;
        const toRate = rates[to];
        if (!toRate)
            throw new common_1.BadRequestException(`No rate for ${to}`);
        return Math.round(inBase * toRate * 100) / 100;
    }
    async fetchRatesFromApi(base) {
        try {
            const url = `https://api.frankfurter.app/latest?from=${base}`;
            const res = await (0, rxjs_1.firstValueFrom)(this.http.get(url));
            const rates = { [base]: 1, ...res.data.rates };
            for (const code of currency_constants_1.SUPPORTED_CURRENCY_CODES) {
                if (!rates[code] && code !== base) {
                    rates[code] = await this.fetchSingleRateFallback(base, code);
                }
            }
            return rates;
        }
        catch (err) {
            this.logger.warn('Frankfurter API failed, using open.er-api.com fallback', err);
            return this.fetchRatesOpenErApi(base);
        }
    }
    async fetchRatesOpenErApi(base) {
        const url = `https://open.er-api.com/v6/latest/${base}`;
        const res = await (0, rxjs_1.firstValueFrom)(this.http.get(url));
        if (res.data.result !== 'success') {
            throw new common_1.BadRequestException('Unable to fetch exchange rates');
        }
        return { [base]: 1, ...res.data.rates };
    }
    async fetchSingleRateFallback(from, to) {
        try {
            const url = `https://open.er-api.com/v6/pair/${from}/${to}`;
            const res = await (0, rxjs_1.firstValueFrom)(this.http.get(url));
            return res.data.conversion_rate;
        }
        catch {
            this.logger.error(`Failed to fetch rate ${from}->${to}`);
            return 1;
        }
    }
    validateCurrency(code) {
        if (!currency_constants_1.SUPPORTED_CURRENCY_CODES.includes(code)) {
            throw new common_1.BadRequestException(`Unsupported currency: ${code}`);
        }
    }
    formatRatesResponse(cache) {
        const filtered = {};
        for (const code of currency_constants_1.SUPPORTED_CURRENCY_CODES) {
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
};
exports.CurrencyService = CurrencyService;
exports.CurrencyService = CurrencyService = CurrencyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], CurrencyService);
//# sourceMappingURL=currency.service.js.map