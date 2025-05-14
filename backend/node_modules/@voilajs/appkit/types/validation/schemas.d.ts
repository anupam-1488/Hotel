/**
 * Creates a new schema
 * @param {Object} definition - Schema definition
 * @returns {Object} Schema object
 */
export function createSchema(definition: any): any;
/**
 * Merges multiple schemas
 * @param {...Object} schemas - Schemas to merge
 * @returns {Object} Merged schema
 */
export function mergeSchemas(...schemas: any[]): any;
/**
 * Extends a schema with additional properties
 * @param {Object} baseSchema - Base schema
 * @param {Object} extensions - Extension properties
 * @returns {Object} Extended schema
 */
export function extendSchema(baseSchema: any, extensions: any): any;
export namespace commonSchemas {
    namespace email {
        export let type: string;
        export let required: boolean;
        let email_1: boolean;
        export { email_1 as email };
        export let trim: boolean;
        export let lowercase: boolean;
        export let maxLength: number;
    }
    namespace password {
        let type_1: string;
        export { type_1 as type };
        let required_1: boolean;
        export { required_1 as required };
        export let minLength: number;
        let maxLength_1: number;
        export { maxLength_1 as maxLength };
        export function validate(value: any): true | "Password must contain at least one uppercase letter" | "Password must contain at least one lowercase letter" | "Password must contain at least one number" | "Password must contain at least one special character";
    }
    namespace username {
        let type_2: string;
        export { type_2 as type };
        let required_2: boolean;
        export { required_2 as required };
        let minLength_1: number;
        export { minLength_1 as minLength };
        let maxLength_2: number;
        export { maxLength_2 as maxLength };
        export let pattern: RegExp;
        let trim_1: boolean;
        export { trim_1 as trim };
        let lowercase_1: boolean;
        export { lowercase_1 as lowercase };
    }
    namespace id {
        let type_3: string;
        export { type_3 as type };
        let required_3: boolean;
        export { required_3 as required };
        let pattern_1: RegExp;
        export { pattern_1 as pattern };
    }
    namespace uuid {
        let type_4: string;
        export { type_4 as type };
        let required_4: boolean;
        export { required_4 as required };
        let uuid_1: boolean;
        export { uuid_1 as uuid };
    }
    namespace url {
        let type_5: string;
        export { type_5 as type };
        let required_5: boolean;
        export { required_5 as required };
        let url_1: boolean;
        export { url_1 as url };
        let trim_2: boolean;
        export { trim_2 as trim };
    }
    namespace phone {
        let type_6: string;
        export { type_6 as type };
        let required_6: boolean;
        export { required_6 as required };
        let pattern_2: RegExp;
        export { pattern_2 as pattern };
        export function transform(value: any): any;
    }
    namespace creditCard {
        let type_7: string;
        export { type_7 as type };
        let required_7: boolean;
        export { required_7 as required };
        let creditCard_1: boolean;
        export { creditCard_1 as creditCard };
        export function transform_1(value: any): any;
        export { transform_1 as transform };
    }
    namespace date {
        let type_8: string[];
        export { type_8 as type };
        let required_8: boolean;
        export { required_8 as required };
        export function transform_2(value: any): any;
        export { transform_2 as transform };
    }
    namespace boolean {
        let type_9: string;
        export { type_9 as type };
        export function transform_3(value: any): boolean;
        export { transform_3 as transform };
    }
    namespace integer {
        let type_10: string;
        export { type_10 as type };
        let integer_1: boolean;
        export { integer_1 as integer };
        export function transform_4(value: any): number;
        export { transform_4 as transform };
    }
    namespace positiveInteger {
        let type_11: string;
        export { type_11 as type };
        let integer_2: boolean;
        export { integer_2 as integer };
        export let min: number;
        export function transform_5(value: any): number;
        export { transform_5 as transform };
    }
    namespace percentage {
        let type_12: string;
        export { type_12 as type };
        let min_1: number;
        export { min_1 as min };
        export let max: number;
        export function transform_6(value: any): number;
        export { transform_6 as transform };
    }
    namespace currency {
        let type_13: string;
        export { type_13 as type };
        let min_2: number;
        export { min_2 as min };
        export let precision: number;
        export function transform_7(value: any): number;
        export { transform_7 as transform };
    }
    namespace tags {
        let type_14: string;
        export { type_14 as type };
        export namespace items {
            let type_15: string;
            export { type_15 as type };
            let minLength_2: number;
            export { minLength_2 as minLength };
            let maxLength_3: number;
            export { maxLength_3 as maxLength };
            let trim_3: boolean;
            export { trim_3 as trim };
            let lowercase_2: boolean;
            export { lowercase_2 as lowercase };
        }
        export let minItems: number;
        export let maxItems: number;
        export let unique: boolean;
    }
    namespace slug {
        let type_16: string;
        export { type_16 as type };
        let required_9: boolean;
        export { required_9 as required };
        let pattern_3: RegExp;
        export { pattern_3 as pattern };
        let minLength_3: number;
        export { minLength_3 as minLength };
        let maxLength_4: number;
        export { maxLength_4 as maxLength };
        let lowercase_3: boolean;
        export { lowercase_3 as lowercase };
        let trim_4: boolean;
        export { trim_4 as trim };
    }
    namespace metadata {
        let type_17: string;
        export { type_17 as type };
        export namespace additionalProperties {
            let type_18: string[];
            export { type_18 as type };
        }
        export let maxProperties: number;
    }
    namespace address {
        let type_19: string;
        export { type_19 as type };
        export namespace properties {
            namespace street {
                let type_20: string;
                export { type_20 as type };
                let required_10: boolean;
                export { required_10 as required };
                let maxLength_5: number;
                export { maxLength_5 as maxLength };
            }
            namespace street2 {
                let type_21: string;
                export { type_21 as type };
                let maxLength_6: number;
                export { maxLength_6 as maxLength };
            }
            namespace city {
                let type_22: string;
                export { type_22 as type };
                let required_11: boolean;
                export { required_11 as required };
                let maxLength_7: number;
                export { maxLength_7 as maxLength };
            }
            namespace state {
                let type_23: string;
                export { type_23 as type };
                let maxLength_8: number;
                export { maxLength_8 as maxLength };
            }
            namespace country {
                let type_24: string;
                export { type_24 as type };
                let required_12: boolean;
                export { required_12 as required };
                let maxLength_9: number;
                export { maxLength_9 as maxLength };
            }
            namespace postalCode {
                let type_25: string;
                export { type_25 as type };
                let required_13: boolean;
                export { required_13 as required };
                let maxLength_10: number;
                export { maxLength_10 as maxLength };
            }
        }
    }
    namespace pagination {
        let type_26: string;
        export { type_26 as type };
        export namespace properties_1 {
            namespace page {
                let type_27: string;
                export { type_27 as type };
                let integer_3: boolean;
                export { integer_3 as integer };
                let min_3: number;
                export { min_3 as min };
                let _default: number;
                export { _default as default };
            }
            namespace limit {
                let type_28: string;
                export { type_28 as type };
                let integer_4: boolean;
                export { integer_4 as integer };
                let min_4: number;
                export { min_4 as min };
                let max_1: number;
                export { max_1 as max };
                let _default_1: number;
                export { _default_1 as default };
            }
            namespace sort {
                let type_29: string;
                export { type_29 as type };
                let _enum: string[];
                export { _enum as enum };
                let _default_2: string;
                export { _default_2 as default };
            }
            namespace sortBy {
                let type_30: string;
                export { type_30 as type };
            }
        }
        export { properties_1 as properties };
    }
    namespace searchQuery {
        let type_31: string;
        export { type_31 as type };
        export namespace properties_2 {
            export namespace q {
                let type_32: string;
                export { type_32 as type };
                let minLength_4: number;
                export { minLength_4 as minLength };
                let maxLength_11: number;
                export { maxLength_11 as maxLength };
                let trim_5: boolean;
                export { trim_5 as trim };
            }
            export namespace filters {
                let type_33: string;
                export { type_33 as type };
                let additionalProperties_1: boolean;
                export { additionalProperties_1 as additionalProperties };
            }
            export namespace page_1 {
                let type_34: string;
                export { type_34 as type };
                let integer_5: boolean;
                export { integer_5 as integer };
                let min_5: number;
                export { min_5 as min };
                let _default_3: number;
                export { _default_3 as default };
            }
            export { page_1 as page };
            export namespace limit_1 {
                let type_35: string;
                export { type_35 as type };
                let integer_6: boolean;
                export { integer_6 as integer };
                let min_6: number;
                export { min_6 as min };
                let max_2: number;
                export { max_2 as max };
                let _default_4: number;
                export { _default_4 as default };
            }
            export { limit_1 as limit };
        }
        export { properties_2 as properties };
    }
    namespace fileUpload {
        let type_36: string;
        export { type_36 as type };
        export namespace properties_3 {
            namespace filename {
                let type_37: string;
                export { type_37 as type };
                let required_14: boolean;
                export { required_14 as required };
                let maxLength_12: number;
                export { maxLength_12 as maxLength };
            }
            namespace mimetype {
                let type_38: string;
                export { type_38 as type };
                let required_15: boolean;
                export { required_15 as required };
            }
            namespace size {
                let type_39: string;
                export { type_39 as type };
                let required_16: boolean;
                export { required_16 as required };
                let max_3: number;
                export { max_3 as max };
            }
            namespace data {
                let type_40: string[];
                export { type_40 as type };
                let required_17: boolean;
                export { required_17 as required };
            }
        }
        export { properties_3 as properties };
    }
    namespace coordinates {
        let type_41: string;
        export { type_41 as type };
        export namespace properties_4 {
            namespace latitude {
                let type_42: string;
                export { type_42 as type };
                let required_18: boolean;
                export { required_18 as required };
                let min_7: number;
                export { min_7 as min };
                let max_4: number;
                export { max_4 as max };
            }
            namespace longitude {
                let type_43: string;
                export { type_43 as type };
                let required_19: boolean;
                export { required_19 as required };
                let min_8: number;
                export { min_8 as min };
                let max_5: number;
                export { max_5 as max };
            }
        }
        export { properties_4 as properties };
    }
    namespace timeRange {
        let type_44: string;
        export { type_44 as type };
        export namespace properties_5 {
            namespace start {
                let type_45: string[];
                export { type_45 as type };
                let required_20: boolean;
                export { required_20 as required };
            }
            namespace end {
                let type_46: string[];
                export { type_46 as type };
                let required_21: boolean;
                export { required_21 as required };
            }
        }
        export { properties_5 as properties };
        export function validate(value: any): true | "Start time must be before end time";
    }
    namespace socialMediaHandles {
        let type_47: string;
        export { type_47 as type };
        export namespace properties_6 {
            namespace twitter {
                let type_48: string;
                export { type_48 as type };
                let pattern_4: RegExp;
                export { pattern_4 as pattern };
            }
            namespace instagram {
                let type_49: string;
                export { type_49 as type };
                let pattern_5: RegExp;
                export { pattern_5 as pattern };
            }
            namespace facebook {
                let type_50: string;
                export { type_50 as type };
                let pattern_6: RegExp;
                export { pattern_6 as pattern };
            }
            namespace linkedin {
                let type_51: string;
                export { type_51 as type };
                let url_2: boolean;
                export { url_2 as url };
            }
            namespace github {
                let type_52: string;
                export { type_52 as type };
                let pattern_7: RegExp;
                export { pattern_7 as pattern };
            }
        }
        export { properties_6 as properties };
    }
}
/**
 * Common schema templates
 */
export const userRegistrationSchema: any;
export const userLoginSchema: any;
export const userProfileSchema: any;
export const passwordResetSchema: any;
export const productSchema: any;
export const orderSchema: any;
export const commentSchema: any;
export const apiKeySchema: any;
