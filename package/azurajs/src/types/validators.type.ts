/**
 * Validator Types
 * Type definitions for Azura validation system
 */

/**
 * Validation issue interface
 */
export interface ValidationIssue {
  path: (string | number)[];
  message: string;
  code: string;
  expected?: string;
  received?: string;
}

/**
 * Validator result types
 */
export type ValidatorResult<T> = 
  | { success: true; data: T }
  | { success: false; error: ValidationError };

/**
 * Custom validation function
 */
export type CustomValidation<T> = (value: T) => boolean | string;

/**
 * Validator shape for objects
 */
export type ValidatorShape<T extends Record<string, any>> = {
  [K in keyof T]: BaseValidator<T[K]>;
};

/**
 * Infer type from validator
 */
export type Infer<T extends BaseValidator<any>> = T extends BaseValidator<infer U> ? U : never;

/**
 * Base validator interface
 */
export interface BaseValidator<T> {
  parse(data: unknown, path?: (string | number)[]): T;
  safeParse(data: unknown): ValidatorResult<T>;
  optional(): BaseValidator<T | undefined>;
  nullable(): BaseValidator<T | null>;
  default(value: T): BaseValidator<T>;
  describe(description: string): BaseValidator<T>;
  refine(validator: (value: T) => boolean, message?: string): BaseValidator<T>;
}

/**
 * String validator methods
 */
export interface StringValidatorMethods {
  min(length: number, message?: string): StringValidator;
  max(length: number, message?: string): StringValidator;
  length(length: number): StringValidator;
  regex(pattern: RegExp, message?: string): StringValidator;
  email(message?: string): StringValidator;
  url(message?: string): StringValidator;
  uuid(message?: string): StringValidator;
  trim(): StringValidator;
  toLowerCase(): StringValidator;
  toUpperCase(): StringValidator;
  startsWith(prefix: string): StringValidator;
  endsWith(suffix: string): StringValidator;
  includes(substring: string): StringValidator;
}

/**
 * Number validator methods
 */
export interface NumberValidatorMethods {
  min(value: number): NumberValidator;
  max(value: number): NumberValidator;
  int(): NumberValidator;
  positive(): NumberValidator;
  negative(): NumberValidator;
  multipleOf(value: number): NumberValidator;
}

/**
 * Array validator methods
 */
export interface ArrayValidatorMethods<T> {
  min(length: number): ArrayValidator<T>;
  max(length: number): ArrayValidator<T>;
  length(length: number): ArrayValidator<T>;
  nonempty(): ArrayValidator<T>;
}

/**
 * Object validator methods
 */
export interface ObjectValidatorMethods<T extends Record<string, any>> {
  strict(): ObjectValidator<T>;
  passthrough(): ObjectValidator<T>;
  partial(): ObjectValidator<Partial<T>>;
  pick<K extends keyof T>(...keys: K[]): ObjectValidator<Pick<T, K>>;
  omit<K extends keyof T>(...keys: K[]): ObjectValidator<Omit<T, K>>;
}

/**
 * Date validator methods
 */
export interface DateValidatorMethods {
  min(date: Date): DateValidator;
  max(date: Date): DateValidator;
}

/**
 * Import actual validator classes (will be defined in Validator.ts)
 */
declare class StringValidator implements BaseValidator<string>, StringValidatorMethods {
  parse(data: unknown, path?: (string | number)[]): string;
  safeParse(data: unknown): ValidatorResult<string>;
  optional(): BaseValidator<string | undefined>;
  nullable(): BaseValidator<string | null>;
  default(value: string): BaseValidator<string>;
  describe(description: string): this;
  refine(validator: (value: string) => boolean, message?: string): this;
  min(length: number, message?: string): this;
  max(length: number, message?: string): this;
  length(length: number): this;
  regex(pattern: RegExp, message?: string): this;
  email(message?: string): this;
  url(message?: string): this;
  uuid(message?: string): this;
  trim(): this;
  toLowerCase(): this;
  toUpperCase(): this;
  startsWith(prefix: string): this;
  endsWith(suffix: string): this;
  includes(substring: string): this;
}

declare class NumberValidator implements BaseValidator<number>, NumberValidatorMethods {
  parse(data: unknown, path?: (string | number)[]): number;
  safeParse(data: unknown): ValidatorResult<number>;
  optional(): BaseValidator<number | undefined>;
  nullable(): BaseValidator<number | null>;
  default(value: number): BaseValidator<number>;
  describe(description: string): this;
  refine(validator: (value: number) => boolean, message?: string): this;
  min(value: number): this;
  max(value: number): this;
  int(): this;
  positive(): this;
  negative(): this;
  multipleOf(value: number): this;
}

declare class BooleanValidator implements BaseValidator<boolean> {
  parse(data: unknown, path?: (string | number)[]): boolean;
  safeParse(data: unknown): ValidatorResult<boolean>;
  optional(): BaseValidator<boolean | undefined>;
  nullable(): BaseValidator<boolean | null>;
  default(value: boolean): BaseValidator<boolean>;
  describe(description: string): this;
  refine(validator: (value: boolean) => boolean, message?: string): this;
}

declare class ArrayValidator<T> implements BaseValidator<T[]>, ArrayValidatorMethods<T> {
  parse(data: unknown, path?: (string | number)[]): T[];
  safeParse(data: unknown): ValidatorResult<T[]>;
  optional(): BaseValidator<T[] | undefined>;
  nullable(): BaseValidator<T[] | null>;
  default(value: T[]): BaseValidator<T[]>;
  describe(description: string): this;
  refine(validator: (value: T[]) => boolean, message?: string): this;
  min(length: number): this;
  max(length: number): this;
  length(length: number): this;
  nonempty(): this;
}

declare class ObjectValidator<T extends Record<string, any>> implements BaseValidator<T>, ObjectValidatorMethods<T> {
  parse(data: unknown, path?: (string | number)[]): T;
  safeParse(data: unknown): ValidatorResult<T>;
  optional(): BaseValidator<T | undefined>;
  nullable(): BaseValidator<T | null>;
  default(value: T): BaseValidator<T>;
  describe(description: string): this;
  refine(validator: (value: T) => boolean, message?: string): this;
  strict(): this;
  passthrough(): this;
  partial(): ObjectValidator<Partial<T>>;
  pick<K extends keyof T>(...keys: K[]): ObjectValidator<Pick<T, K>>;
  omit<K extends keyof T>(...keys: K[]): ObjectValidator<Omit<T, K>>;
}

declare class DateValidator implements BaseValidator<Date>, DateValidatorMethods {
  parse(data: unknown, path?: (string | number)[]): Date;
  safeParse(data: unknown): ValidatorResult<Date>;
  optional(): BaseValidator<Date | undefined>;
  nullable(): BaseValidator<Date | null>;
  default(value: Date): BaseValidator<Date>;
  describe(description: string): this;
  refine(validator: (value: Date) => boolean, message?: string): this;
  min(date: Date): this;
  max(date: Date): this;
}

declare class EnumValidator<T extends string | number> implements BaseValidator<T> {
  parse(data: unknown, path?: (string | number)[]): T;
  safeParse(data: unknown): ValidatorResult<T>;
  optional(): BaseValidator<T | undefined>;
  nullable(): BaseValidator<T | null>;
  default(value: T): BaseValidator<T>;
  describe(description: string): this;
  refine(validator: (value: T) => boolean, message?: string): this;
}

declare class LiteralValidator<T extends string | number | boolean> implements BaseValidator<T> {
  parse(data: unknown, path?: (string | number)[]): T;
  safeParse(data: unknown): ValidatorResult<T>;
  optional(): BaseValidator<T | undefined>;
  nullable(): BaseValidator<T | null>;
  default(value: T): BaseValidator<T>;
  describe(description: string): this;
  refine(validator: (value: T) => boolean, message?: string): this;
}

declare class UnionValidator<T> implements BaseValidator<T> {
  parse(data: unknown, path?: (string | number)[]): T;
  safeParse(data: unknown): ValidatorResult<T>;
  optional(): BaseValidator<T | undefined>;
  nullable(): BaseValidator<T | null>;
  default(value: T): BaseValidator<T>;
  describe(description: string): this;
  refine(validator: (value: T) => boolean, message?: string): this;
}

declare class ValidationError extends Error {
  readonly errors: ValidationIssue[];
  constructor(errors: ValidationIssue[]);
  format(): Record<string, string[]>;
}

/**
 * Validator factory type
 */
export interface ValidatorFactory {
  string(): StringValidator;
  number(): NumberValidator;
  boolean(): BooleanValidator;
  date(): DateValidator;
  array<T>(itemValidator: BaseValidator<T>): ArrayValidator<T>;
  object<T extends Record<string, any>>(shape: ValidatorShape<T>): ObjectValidator<T>;
  enum<T extends string | number>(values: readonly T[]): EnumValidator<T>;
  literal<T extends string | number | boolean>(value: T): LiteralValidator<T>;
  union<T>(...validators: BaseValidator<any>[]): UnionValidator<T>;
  
  // Aliases
  str(): StringValidator;
  num(): NumberValidator;
  bool(): BooleanValidator;
  arr<T>(itemValidator: BaseValidator<T>): ArrayValidator<T>;
  obj<T extends Record<string, any>>(shape: ValidatorShape<T>): ObjectValidator<T>;
}
