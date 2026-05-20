import { ValidationOptions, ValidatorConstraintInterface } from 'class-validator';
export declare const PASSWORD_STRENGTH_REGEX: RegExp;
export declare const PASSWORD_STRENGTH_MESSAGE = "Password must be 8\u2013128 characters and include uppercase, lowercase, a number, and a special character";
export declare class IsStrongPasswordConstraint implements ValidatorConstraintInterface {
    validate(password: string): boolean;
    defaultMessage(): string;
}
export declare function IsStrongPassword(validationOptions?: ValidationOptions): (object: object, propertyName: string) => void;
