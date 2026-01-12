/**
 * Azura Validator - Type-safe validation library inspired by Zod
 * Provides runtime validation with TypeScript type inference
 */

import type { ValidationIssue } from '../../types/validators.type';

/**
 * Validation error class
 */
export class ValidationError extends Error {
  public readonly errors: ValidationIssue[];

  constructor(errors: ValidationIssue[]) {
    super(errors.map((e) => e.message).join(", "));
    this.name = "ValidationError";
    this.errors = errors;
  }

  format(): Record<string, string[]> {
    const formatted: Record<string, string[]> = {};
    for (const error of this.errors) {
      const path = error.path.join(".");
      if (!formatted[path]) {
        formatted[path] = [];
      }
      formatted[path].push(error.message);
    }
    return formatted;
  }
}

/**
 * Base validator class
 */
export abstract class BaseValidator<T> {
  protected _optional = false;
  protected _nullable = false;
  protected _defaultValue?: T;
  protected _description?: string;
  protected _customValidations: Array<(value: T) => boolean | string> = [];

  /**
   * Parse and validate data
   */
  abstract parse(data: unknown, path?: (string | number)[]): T;

  /**
   * Safe parse that returns result object instead of throwing
   */
  safeParse(
    data: unknown
  ): { success: true; data: T } | { success: false; error: ValidationError } {
    try {
      const result = this.parse(data);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, error };
      }
      return {
        success: false,
        error: new ValidationError([
          {
            path: [],
            message: error instanceof Error ? error.message : String(error),
            code: "unknown_error",
          },
        ]),
      };
    }
  }

  /**
   * Make this field optional
   */
  optional(): BaseValidator<T | undefined> {
    const clone = this.clone()!;
    clone._optional = true;
    return clone as any;
  }

  /**
   * Make this field nullable
   */
  nullable(): BaseValidator<T | null> {
    const clone = this.clone();
    clone._nullable = true;
    return clone as any;
  }

  /**
   * Set default value
   */
  default(value: T): BaseValidator<T> {
    const clone = this.clone();
    clone._defaultValue = value;
    return clone;
  }

  /**
   * Add description
   */
  describe(description: string): this {
    this._description = description;
    return this;
  }

  /**
   * Add custom validation
   */
  refine(validator: (value: T) => boolean, message?: string): this {
    this._customValidations.push((value: T) => validator(value) || message || "Validation failed");
    return this;
  }

  /**
   * Clone validator
   */
  protected abstract clone(): BaseValidator<T>;

  /**
   * Handle optional/nullable/default
   */
  protected handleOptionalAndNullable(
    data: unknown,
    path: (string | number)[]
  ): T | undefined | null {
    if (data === undefined) {
      if (this._defaultValue !== undefined) {
        return this._defaultValue;
      }
      if (this._optional) {
        return undefined;
      }
      throw new ValidationError([
        {
          path,
          message: "Required field",
          code: "required",
          expected: "value",
          received: "undefined",
        },
      ]);
    }

    if (data === null) {
      if (this._nullable) {
        return null;
      }
      throw new ValidationError([
        {
          path,
          message: "Cannot be null",
          code: "invalid_type",
          expected: "non-null",
          received: "null",
        },
      ]);
    }

    return data as T;
  }

  /**
   * Run custom validations
   */
  protected runCustomValidations(value: T, path: (string | number)[]): void {
    for (const validation of this._customValidations) {
      const result = validation(value);
      if (result !== true) {
        throw new ValidationError([
          {
            path,
            message: typeof result === "string" ? result : "Custom validation failed",
            code: "custom",
          },
        ]);
      }
    }
  }
}

/**
 * String validator
 */
export class StringValidator extends BaseValidator<string> {
  private _minLength?: number;
  private _maxLength?: number;
  private _pattern?: RegExp;
  private _email = false;
  private _url = false;
  private _uuid = false;
  private _trim = false;
  private _lowercase = false;
  private _uppercase = false;

  parse(data: unknown, path: (string | number)[] = []): string {
    const handled = this.handleOptionalAndNullable(data, path);
    if (handled === undefined || handled === null) return handled as any;

    if (typeof data !== "string") {
      throw new ValidationError([
        {
          path,
          message: "Expected string",
          code: "invalid_type",
          expected: "string",
          received: typeof data,
        },
      ]);
    }

    let value = data;

    if (this._trim) value = value.trim();
    if (this._lowercase) value = value.toLowerCase();
    if (this._uppercase) value = value.toUpperCase();

    if (this._minLength !== undefined && value.length < this._minLength) {
      throw new ValidationError([
        {
          path,
          message: `String must be at least ${this._minLength} characters`,
          code: "too_small",
        },
      ]);
    }

    if (this._maxLength !== undefined && value.length > this._maxLength) {
      throw new ValidationError([
        {
          path,
          message: `String must be at most ${this._maxLength} characters`,
          code: "too_big",
        },
      ]);
    }

    if (this._pattern && !this._pattern.test(value)) {
      throw new ValidationError([
        {
          path,
          message: `String does not match pattern`,
          code: "invalid_string",
        },
      ]);
    }

    if (this._email && !this.isEmail(value)) {
      throw new ValidationError([
        {
          path,
          message: "Invalid email address",
          code: "invalid_string",
        },
      ]);
    }

    if (this._url && !this.isUrl(value)) {
      throw new ValidationError([
        {
          path,
          message: "Invalid URL",
          code: "invalid_string",
        },
      ]);
    }

    if (this._uuid && !this.isUuid(value)) {
      throw new ValidationError([
        {
          path,
          message: "Invalid UUID",
          code: "invalid_string",
        },
      ]);
    }

    this.runCustomValidations(value, path);

    return value;
  }

  min(length: number, message?: string): this {
    this._minLength = length;
    return this;
  }

  max(length: number, message?: string): this {
    this._maxLength = length;
    return this;
  }

  length(length: number): this {
    this._minLength = length;
    this._maxLength = length;
    return this;
  }

  regex(pattern: RegExp, message?: string): this {
    this._pattern = pattern;
    return this;
  }

  email(message?: string): this {
    this._email = true;
    return this;
  }

  url(message?: string): this {
    this._url = true;
    return this;
  }

  uuid(message?: string): this {
    this._uuid = true;
    return this;
  }

  trim(): this {
    this._trim = true;
    return this;
  }

  toLowerCase(): this {
    this._lowercase = true;
    return this;
  }

  toUpperCase(): this {
    this._uppercase = true;
    return this;
  }

  startsWith(prefix: string): this {
    return this.refine((val) => val.startsWith(prefix), `String must start with "${prefix}"`);
  }

  endsWith(suffix: string): this {
    return this.refine((val) => val.endsWith(suffix), `String must end with "${suffix}"`);
  }

  includes(substring: string): this {
    return this.refine((val) => val.includes(substring), `String must include "${substring}"`);
  }

  protected clone(): StringValidator {
    const cloned = new StringValidator();
    cloned._optional = this._optional;
    cloned._nullable = this._nullable;
    cloned._defaultValue = this._defaultValue;
    cloned._minLength = this._minLength;
    cloned._maxLength = this._maxLength;
    cloned._pattern = this._pattern;
    cloned._email = this._email;
    cloned._url = this._url;
    cloned._uuid = this._uuid;
    cloned._trim = this._trim;
    cloned._lowercase = this._lowercase;
    cloned._uppercase = this._uppercase;
    cloned._customValidations = [...this._customValidations];
    return cloned;
  }

  private isEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  private isUrl(value: string): boolean {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  private isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
  }
}

/**
 * Number validator
 */
export class NumberValidator extends BaseValidator<number> {
  private _min?: number;
  private _max?: number;
  private _integer = false;
  private _positive = false;
  private _negative = false;
  private _multipleOf?: number;

  parse(data: unknown, path: (string | number)[] = []): number {
    const handled = this.handleOptionalAndNullable(data, path);
    if (handled === undefined || handled === null) return handled as any;

    if (typeof data !== "number" || Number.isNaN(data)) {
      throw new ValidationError([
        {
          path,
          message: "Expected number",
          code: "invalid_type",
          expected: "number",
          received: typeof data,
        },
      ]);
    }

    if (this._integer && !Number.isInteger(data)) {
      throw new ValidationError([
        {
          path,
          message: "Expected integer",
          code: "invalid_type",
        },
      ]);
    }

    if (this._positive && data <= 0) {
      throw new ValidationError([
        {
          path,
          message: "Number must be positive",
          code: "too_small",
        },
      ]);
    }

    if (this._negative && data >= 0) {
      throw new ValidationError([
        {
          path,
          message: "Number must be negative",
          code: "too_big",
        },
      ]);
    }

    if (this._min !== undefined && data < this._min) {
      throw new ValidationError([
        {
          path,
          message: `Number must be at least ${this._min}`,
          code: "too_small",
        },
      ]);
    }

    if (this._max !== undefined && data > this._max) {
      throw new ValidationError([
        {
          path,
          message: `Number must be at most ${this._max}`,
          code: "too_big",
        },
      ]);
    }

    if (this._multipleOf !== undefined && data % this._multipleOf !== 0) {
      throw new ValidationError([
        {
          path,
          message: `Number must be multiple of ${this._multipleOf}`,
          code: "invalid_number",
        },
      ]);
    }

    this.runCustomValidations(data, path);

    return data;
  }

  min(value: number): this {
    this._min = value;
    return this;
  }

  max(value: number): this {
    this._max = value;
    return this;
  }

  int(): this {
    this._integer = true;
    return this;
  }

  positive(): this {
    this._positive = true;
    return this;
  }

  negative(): this {
    this._negative = true;
    return this;
  }

  multipleOf(value: number): this {
    this._multipleOf = value;
    return this;
  }

  protected clone(): NumberValidator {
    const cloned = new NumberValidator();
    cloned._optional = this._optional;
    cloned._nullable = this._nullable;
    cloned._defaultValue = this._defaultValue;
    cloned._min = this._min;
    cloned._max = this._max;
    cloned._integer = this._integer;
    cloned._positive = this._positive;
    cloned._negative = this._negative;
    cloned._multipleOf = this._multipleOf;
    cloned._customValidations = [...this._customValidations];
    return cloned;
  }
}

/**
 * Boolean validator
 */
export class BooleanValidator extends BaseValidator<boolean> {
  parse(data: unknown, path: (string | number)[] = []): boolean {
    const handled = this.handleOptionalAndNullable(data, path);
    if (handled === undefined || handled === null) return handled as any;

    if (typeof data !== "boolean") {
      throw new ValidationError([
        {
          path,
          message: "Expected boolean",
          code: "invalid_type",
          expected: "boolean",
          received: typeof data,
        },
      ]);
    }

    this.runCustomValidations(data, path);

    return data;
  }

  protected clone(): BooleanValidator {
    const cloned = new BooleanValidator();
    cloned._optional = this._optional;
    cloned._nullable = this._nullable;
    cloned._defaultValue = this._defaultValue;
    cloned._customValidations = [...this._customValidations];
    return cloned;
  }
}

/**
 * Array validator
 */
export class ArrayValidator<T> extends BaseValidator<T[]> {
  private _minLength?: number;
  private _maxLength?: number;
  private _itemValidator: BaseValidator<T>;

  constructor(itemValidator: BaseValidator<T>) {
    super();
    this._itemValidator = itemValidator;
  }

  parse(data: unknown, path: (string | number)[] = []): T[] {
    const handled = this.handleOptionalAndNullable(data, path);
    if (handled === undefined || handled === null) return handled as any;

    if (!Array.isArray(data)) {
      throw new ValidationError([
        {
          path,
          message: "Expected array",
          code: "invalid_type",
          expected: "array",
          received: typeof data,
        },
      ]);
    }

    if (this._minLength !== undefined && data.length < this._minLength) {
      throw new ValidationError([
        {
          path,
          message: `Array must have at least ${this._minLength} items`,
          code: "too_small",
        },
      ]);
    }

    if (this._maxLength !== undefined && data.length > this._maxLength) {
      throw new ValidationError([
        {
          path,
          message: `Array must have at most ${this._maxLength} items`,
          code: "too_big",
        },
      ]);
    }

    const errors: ValidationIssue[] = [];
    const result: T[] = [];

    for (let i = 0; i < data.length; i++) {
      try {
        result.push(this._itemValidator.parse(data[i], [...path, i]));
      } catch (error) {
        if (error instanceof ValidationError) {
          errors.push(...error.errors);
        }
      }
    }

    if (errors.length > 0) {
      throw new ValidationError(errors);
    }

    this.runCustomValidations(result, path);

    return result;
  }

  min(length: number): this {
    this._minLength = length;
    return this;
  }

  max(length: number): this {
    this._maxLength = length;
    return this;
  }

  length(length: number): this {
    this._minLength = length;
    this._maxLength = length;
    return this;
  }

  nonempty(): this {
    this._minLength = 1;
    return this;
  }

  protected clone(): ArrayValidator<T> {
    const cloned = new ArrayValidator(this._itemValidator);
    cloned._optional = this._optional;
    cloned._nullable = this._nullable;
    cloned._defaultValue = this._defaultValue;
    cloned._minLength = this._minLength;
    cloned._maxLength = this._maxLength;
    cloned._customValidations = [...this._customValidations];
    return cloned;
  }
}

/**
 * Object validator
 */
export class ObjectValidator<T extends Record<string, any>> extends BaseValidator<T> {
  private _shape: { [K in keyof T]: BaseValidator<T[K]> };
  private _strict = false;
  private _passthrough = false;

  constructor(shape: { [K in keyof T]: BaseValidator<T[K]> }) {
    super();
    this._shape = shape;
  }

  parse(data: unknown, path: (string | number)[] = []): T {
    const handled = this.handleOptionalAndNullable(data, path);
    if (handled === undefined || handled === null) return handled as any;

    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      throw new ValidationError([
        {
          path,
          message: "Expected object",
          code: "invalid_type",
          expected: "object",
          received: Array.isArray(data) ? "array" : typeof data,
        },
      ]);
    }

    const errors: ValidationIssue[] = [];
    const result: any = {};
    const inputKeys = Object.keys(data);
    const shapeKeys = Object.keys(this._shape);

    // Validate shape keys
    for (const key of shapeKeys) {
      try {
        result[key] = this._shape[key]?.parse((data as any)[key], [...path, key]);
      } catch (error) {
        if (error instanceof ValidationError) {
          errors.push(...error.errors);
        }
      }
    }

    // Handle extra keys
    const extraKeys = inputKeys.filter((k) => !shapeKeys.includes(k));
    if (this._strict && extraKeys.length > 0) {
      errors.push({
        path,
        message: `Unexpected keys: ${extraKeys.join(", ")}`,
        code: "unrecognized_keys",
      });
    } else if (this._passthrough) {
      for (const key of extraKeys) {
        result[key] = (data as any)[key];
      }
    }

    if (errors.length > 0) {
      throw new ValidationError(errors);
    }

    this.runCustomValidations(result, path);

    return result;
  }

  strict(): this {
    this._strict = true;
    return this;
  }

  passthrough(): this {
    this._passthrough = true;
    return this;
  }

  partial(): ObjectValidator<Partial<T>> {
    const newShape: any = {};
    for (const key in this._shape) {
      newShape[key] = this._shape[key].optional();
    }
    return new ObjectValidator(newShape);
  }

  pick<K extends keyof T>(...keys: K[]): ObjectValidator<Pick<T, K>> {
    const newShape: any = {};
    for (const key of keys) {
      newShape[key] = this._shape[key];
    }
    return new ObjectValidator(newShape);
  }

  omit<K extends keyof T>(...keys: K[]): ObjectValidator<Omit<T, K>> {
    const newShape: any = {};
    for (const key in this._shape) {
      if (!keys.includes(key as unknown as K)) {
        newShape[key] = this._shape[key];
      }
    }
    return new ObjectValidator(newShape);
  }

  protected clone(): ObjectValidator<T> {
    const cloned = new ObjectValidator(this._shape);
    cloned._optional = this._optional;
    cloned._nullable = this._nullable;
    cloned._defaultValue = this._defaultValue;
    cloned._strict = this._strict;
    cloned._passthrough = this._passthrough;
    cloned._customValidations = [...this._customValidations];
    return cloned;
  }
}

/**
 * Enum validator
 */
export class EnumValidator<T extends string | number> extends BaseValidator<T> {
  private _values: readonly T[];

  constructor(values: readonly T[]) {
    super();
    this._values = values;
  }

  parse(data: unknown, path: (string | number)[] = []): T {
    const handled = this.handleOptionalAndNullable(data, path);
    if (handled === undefined || handled === null) return handled as any;

    if (!this._values.includes(data as T)) {
      throw new ValidationError([
        {
          path,
          message: `Expected one of: ${this._values.join(", ")}`,
          code: "invalid_enum_value",
          received: String(data),
        },
      ]);
    }

    this.runCustomValidations(data as T, path);

    return data as T;
  }

  protected clone(): EnumValidator<T> {
    const cloned = new EnumValidator(this._values);
    cloned._optional = this._optional;
    cloned._nullable = this._nullable;
    cloned._defaultValue = this._defaultValue;
    cloned._customValidations = [...this._customValidations];
    return cloned;
  }
}

/**
 * Date validator
 */
export class DateValidator extends BaseValidator<Date> {
  private _min?: Date;
  private _max?: Date;

  parse(data: unknown, path: (string | number)[] = []): Date {
    const handled = this.handleOptionalAndNullable(data, path);
    if (handled === undefined || handled === null) return handled as any;

    let date: Date;

    if (data instanceof Date) {
      date = data;
    } else if (typeof data === "string" || typeof data === "number") {
      date = new Date(data);
    } else {
      throw new ValidationError([
        {
          path,
          message: "Expected date",
          code: "invalid_type",
          expected: "date",
          received: typeof data,
        },
      ]);
    }

    if (isNaN(date.getTime())) {
      throw new ValidationError([
        {
          path,
          message: "Invalid date",
          code: "invalid_date",
        },
      ]);
    }

    if (this._min && date < this._min) {
      throw new ValidationError([
        {
          path,
          message: `Date must be after ${this._min.toISOString()}`,
          code: "too_small",
        },
      ]);
    }

    if (this._max && date > this._max) {
      throw new ValidationError([
        {
          path,
          message: `Date must be before ${this._max.toISOString()}`,
          code: "too_big",
        },
      ]);
    }

    this.runCustomValidations(date, path);

    return date;
  }

  min(date: Date): this {
    this._min = date;
    return this;
  }

  max(date: Date): this {
    this._max = date;
    return this;
  }

  protected clone(): DateValidator {
    const cloned = new DateValidator();
    cloned._optional = this._optional;
    cloned._nullable = this._nullable;
    cloned._defaultValue = this._defaultValue;
    cloned._min = this._min;
    cloned._max = this._max;
    cloned._customValidations = [...this._customValidations];
    return cloned;
  }
}

/**
 * Literal validator
 */
export class LiteralValidator<T extends string | number | boolean> extends BaseValidator<T> {
  private _value: T;

  constructor(value: T) {
    super();
    this._value = value;
  }

  parse(data: unknown, path: (string | number)[] = []): T {
    const handled = this.handleOptionalAndNullable(data, path);
    if (handled === undefined || handled === null) return handled as any;

    if (data !== this._value) {
      throw new ValidationError([
        {
          path,
          message: `Expected literal value: ${this._value}`,
          code: "invalid_literal",
          expected: String(this._value),
          received: String(data),
        },
      ]);
    }

    return data as T;
  }

  protected clone(): LiteralValidator<T> {
    const cloned = new LiteralValidator(this._value);
    cloned._optional = this._optional;
    cloned._nullable = this._nullable;
    cloned._defaultValue = this._defaultValue;
    cloned._customValidations = [...this._customValidations];
    return cloned;
  }
}

/**
 * Union validator
 */
export class UnionValidator<T> extends BaseValidator<T> {
  private _validators: BaseValidator<any>[];

  constructor(validators: BaseValidator<any>[]) {
    super();
    this._validators = validators;
  }

  parse(data: unknown, path: (string | number)[] = []): T {
    const handled = this.handleOptionalAndNullable(data, path);
    if (handled === undefined || handled === null) return handled as any;

    const errors: ValidationIssue[] = [];

    for (const validator of this._validators) {
      try {
        return validator.parse(data, path);
      } catch (error) {
        if (error instanceof ValidationError) {
          errors.push(...error.errors);
        }
      }
    }

    throw new ValidationError([
      {
        path,
        message: "Value does not match any union type",
        code: "invalid_union",
      },
    ]);
  }

  protected clone(): UnionValidator<T> {
    const cloned = new UnionValidator<T>(this._validators);
    cloned._optional = this._optional;
    cloned._nullable = this._nullable;
    cloned._defaultValue = this._defaultValue as T | undefined;
    cloned._customValidations = [...this._customValidations] as Array<(value: T) => boolean | string>;
    return cloned;
  }
}

/**
 * Main validator factory (similar to Zod's z)
 */
export const v = {
  string: () => new StringValidator(),
  number: () => new NumberValidator(),
  boolean: () => new BooleanValidator(),
  date: () => new DateValidator(),
  array: <T>(itemValidator: BaseValidator<T>) => new ArrayValidator(itemValidator),
  object: <T extends Record<string, any>>(shape: { [K in keyof T]: BaseValidator<T[K]> }) =>
    new ObjectValidator(shape),
  enum: <T extends string | number>(values: readonly T[]) => new EnumValidator(values),
  literal: <T extends string | number | boolean>(value: T) => new LiteralValidator(value),
  union: <T>(...validators: BaseValidator<any>[]) => new UnionValidator<T>(validators),

  // Aliases
  str: () => new StringValidator(),
  num: () => new NumberValidator(),
  bool: () => new BooleanValidator(),
  arr: <T>(itemValidator: BaseValidator<T>) => new ArrayValidator(itemValidator),
  obj: <T extends Record<string, any>>(shape: { [K in keyof T]: BaseValidator<T[K]> }) =>
    new ObjectValidator(shape),
};

// Export types
export type Infer<T extends BaseValidator<any>> = T extends BaseValidator<infer U> ? U : never;
