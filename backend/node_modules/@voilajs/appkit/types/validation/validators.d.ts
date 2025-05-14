/**
 * Validates data against schema
 * @param {*} data - Data to validate
 * @param {Object} schema - Validation schema
 * @param {Object} [options] - Validation options
 * @returns {{valid: boolean, errors?: Array}} Validation result
 */
export function validate(data: any, schema: any, options?: any): {
    valid: boolean;
    errors?: any[];
};
/**
 * Creates a reusable validator function
 * @param {Object} schema - Validation schema
 * @param {Object} [options] - Default options
 * @returns {Function} Validator function
 */
export function createValidator(schema: any, options?: any): Function;
/**
 * Validates data asynchronously
 * @param {*} data - Data to validate
 * @param {Object} schema - Validation schema
 * @param {Object} [options] - Validation options
 * @returns {Promise<{valid: boolean, errors?: Array}>} Validation result
 */
export function validateAsync(data: any, schema: any, options?: any): Promise<{
    valid: boolean;
    errors?: any[];
}>;
/**
 * Creates a reusable async validator function
 * @param {Object} schema - Validation schema
 * @param {Object} [options] - Default options
 * @returns {Function} Async validator function
 */
export function createAsyncValidator(schema: any, options?: any): Function;
/**
 * Common validators
 */
export function isEmail(value: any): boolean;
export function isUrl(value: any): boolean;
export function isUuid(value: any): boolean;
export function isCreditCard(value: any): boolean;
export function isPhoneNumber(value: any): boolean;
export function isAlphanumeric(value: any): boolean;
export function isAlpha(value: any): boolean;
export function isNumeric(value: any): boolean;
export function isHexColor(value: any): boolean;
export function isIpAddress(value: any): any;
export function isSlug(value: any): boolean;
export function isStrongPassword(value: any): boolean;
