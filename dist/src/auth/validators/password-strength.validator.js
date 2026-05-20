"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsStrongPasswordConstraint = exports.PASSWORD_STRENGTH_MESSAGE = exports.PASSWORD_STRENGTH_REGEX = void 0;
exports.IsStrongPassword = IsStrongPassword;
const class_validator_1 = require("class-validator");
exports.PASSWORD_STRENGTH_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,128}$/;
exports.PASSWORD_STRENGTH_MESSAGE = 'Password must be 8–128 characters and include uppercase, lowercase, a number, and a special character';
let IsStrongPasswordConstraint = class IsStrongPasswordConstraint {
    validate(password) {
        return typeof password === 'string' && exports.PASSWORD_STRENGTH_REGEX.test(password);
    }
    defaultMessage() {
        return exports.PASSWORD_STRENGTH_MESSAGE;
    }
};
exports.IsStrongPasswordConstraint = IsStrongPasswordConstraint;
exports.IsStrongPasswordConstraint = IsStrongPasswordConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'isStrongPassword', async: false })
], IsStrongPasswordConstraint);
function IsStrongPassword(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsStrongPasswordConstraint,
        });
    };
}
//# sourceMappingURL=password-strength.validator.js.map