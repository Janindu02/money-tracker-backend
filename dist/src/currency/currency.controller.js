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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../decorators/public.decorator");
const current_user_decorator_1 = require("../decorators/current-user.decorator");
const currency_service_1 = require("./currency.service");
const convert_currency_dto_1 = require("./dto/convert-currency.dto");
const prisma_service_1 = require("../prisma/prisma.service");
let CurrencyController = class CurrencyController {
    currencyService;
    prisma;
    constructor(currencyService, prisma) {
        this.currencyService = currencyService;
        this.prisma = prisma;
    }
    getSupported() {
        return this.currencyService.getSupported();
    }
    getRates(query) {
        return this.currencyService.getRates(query.base ?? 'USD');
    }
    convert(dto) {
        return this.currencyService.convert(dto.amount, dto.from, dto.to);
    }
    async getUserCurrencyPreferences(user) {
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
};
exports.CurrencyController = CurrencyController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('supported'),
    (0, swagger_1.ApiOperation)({ summary: 'List supported currencies (20 popular incl. LKR, USD)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CurrencyController.prototype, "getSupported", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('rates'),
    (0, swagger_1.ApiOperation)({ summary: 'Get exchange rates from a base currency' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [convert_currency_dto_1.RatesQueryDto]),
    __metadata("design:returntype", void 0)
], CurrencyController.prototype, "getRates", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('convert'),
    (0, swagger_1.ApiOperation)({ summary: 'Convert amount between currencies' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [convert_currency_dto_1.ConvertCurrencyDto]),
    __metadata("design:returntype", void 0)
], CurrencyController.prototype, "convert", null);
__decorate([
    (0, common_1.Get)('preferences'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get user currency + live rates for display' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CurrencyController.prototype, "getUserCurrencyPreferences", null);
exports.CurrencyController = CurrencyController = __decorate([
    (0, swagger_1.ApiTags)('currency'),
    (0, common_1.Controller)('currency'),
    __metadata("design:paramtypes", [currency_service_1.CurrencyService,
        prisma_service_1.PrismaService])
], CurrencyController);
//# sourceMappingURL=currency.controller.js.map