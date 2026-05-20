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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatesQueryDto = exports.ConvertCurrencyDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class ConvertCurrencyDto {
    amount;
    from;
    to;
}
exports.ConvertCurrencyDto = ConvertCurrencyDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ConvertCurrencyDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'USD' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConvertCurrencyDto.prototype, "from", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'LKR' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConvertCurrencyDto.prototype, "to", void 0);
class RatesQueryDto {
    base;
}
exports.RatesQueryDto = RatesQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 'USD' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RatesQueryDto.prototype, "base", void 0);
//# sourceMappingURL=convert-currency.dto.js.map