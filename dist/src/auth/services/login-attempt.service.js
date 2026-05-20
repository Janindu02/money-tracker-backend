"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginAttemptService = void 0;
const common_1 = require("@nestjs/common");
let LoginAttemptService = class LoginAttemptService {
    store = new Map();
    maxAttempts = 5;
    lockDurationMs = 15 * 60 * 1000;
    isLocked(email) {
        const key = email.trim().toLowerCase();
        const record = this.store.get(key);
        if (!record?.lockedUntil)
            return false;
        if (Date.now() >= record.lockedUntil) {
            this.store.delete(key);
            return false;
        }
        return true;
    }
    getLockMinutesRemaining(email) {
        const key = email.trim().toLowerCase();
        const record = this.store.get(key);
        if (!record?.lockedUntil)
            return 0;
        const ms = record.lockedUntil - Date.now();
        return ms > 0 ? Math.ceil(ms / 60000) : 0;
    }
    recordFailure(email) {
        const key = email.trim().toLowerCase();
        const record = this.store.get(key) ?? { count: 0 };
        record.count += 1;
        if (record.count >= this.maxAttempts) {
            record.lockedUntil = Date.now() + this.lockDurationMs;
        }
        this.store.set(key, record);
    }
    reset(email) {
        this.store.delete(email.trim().toLowerCase());
    }
};
exports.LoginAttemptService = LoginAttemptService;
exports.LoginAttemptService = LoginAttemptService = __decorate([
    (0, common_1.Injectable)()
], LoginAttemptService);
//# sourceMappingURL=login-attempt.service.js.map