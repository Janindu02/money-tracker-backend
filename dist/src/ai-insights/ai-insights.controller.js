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
exports.AiInsightsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ai_insights_service_1 = require("./ai-insights.service");
const current_user_decorator_1 = require("../decorators/current-user.decorator");
let AiInsightsController = class AiInsightsController {
    aiInsightsService;
    constructor(aiInsightsService) {
        this.aiInsightsService = aiInsightsService;
    }
    getInsights(user) {
        return this.aiInsightsService.getInsights(user.sub);
    }
    generate(user) {
        return this.aiInsightsService.generateInsights(user.sub);
    }
    dismiss(user, id) {
        return this.aiInsightsService.dismiss(user.sub, id);
    }
};
exports.AiInsightsController = AiInsightsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get AI financial insights' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AiInsightsController.prototype, "getInsights", null);
__decorate([
    (0, common_1.Post)('generate'),
    (0, swagger_1.ApiOperation)({ summary: 'Regenerate AI insights' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AiInsightsController.prototype, "generate", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Dismiss an insight' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AiInsightsController.prototype, "dismiss", null);
exports.AiInsightsController = AiInsightsController = __decorate([
    (0, swagger_1.ApiTags)('ai-insights'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('ai-insights'),
    __metadata("design:paramtypes", [ai_insights_service_1.AiInsightsService])
], AiInsightsController);
//# sourceMappingURL=ai-insights.controller.js.map