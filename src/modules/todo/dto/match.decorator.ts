import {
    registerDecorator, ValidationOptions,
    ValidationArguments, ValidatorConstraint,
    ValidatorConstraintInterface
} from 'class-validator';

@ValidatorConstraint({ name: 'isBeforeDate' })
export class IsBeforeDateConstraint implements ValidatorConstraintInterface {
    validate(value: string, args: ValidationArguments) {
        const [relatedField] = args.constraints;
        const relatedValue = (args.object as Record<string, string>)[relatedField];
        if (!value || !relatedValue) return true; // skip if either is absent
        return new Date(value) < new Date(relatedValue);
    }

    defaultMessage(args: ValidationArguments) {
        return `${args.property} must be before ${args.constraints[0]}`;
    }
}

export function IsBeforeDate(property: string, options?: ValidationOptions) {
    return (object: object, propertyName: string) =>
        registerDecorator({
            target: object.constructor,
            propertyName,
            options,
            constraints: [property],
            validator: IsBeforeDateConstraint,
        });
}

@ValidatorConstraint({ name: 'isFutureDate' })
export class IsFutureDateConstraint implements ValidatorConstraintInterface {
    validate(value: string) {
        if (!value) return true; // skip if absent, let @IsOptional handle it
        return new Date(value) > new Date();
    }

    defaultMessage(args: ValidationArguments) {
        return `${args.property} must be a future date`;
    }
}

export function IsFutureDate(options?: ValidationOptions) {
    return (object: object, propertyName: string) =>
        registerDecorator({
            target: object.constructor,
            propertyName,
            options,
            constraints: [],
            validator: IsFutureDateConstraint,
        });
}