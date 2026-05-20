"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBudgetDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_budget_dto_1 = require("./create-budget.dto");
class UpdateBudgetDto extends (0, swagger_1.PartialType)(create_budget_dto_1.CreateBudgetDto) {
}
exports.UpdateBudgetDto = UpdateBudgetDto;
//# sourceMappingURL=update-budget.dto.js.map