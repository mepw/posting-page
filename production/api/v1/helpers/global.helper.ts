/* Vendor modules */
import { NextFunction, Request, RequestHandler, Response } from "express-serve-static-core";

/* Entities (types, interfaces and schemas) */
import { ErrorResponse, FormatResponseParams, FormattedResponse, SuccessResponse } from "../entities/types/global.type";

/* Constants */
import { STATUS_CODE } from "../../../configs/constants/api_request.constants";
import { SHOW_ERROR_DETAILS } from "../../../configs/constants/env.constant";
import { RESPONSE_STATUS } from "../../../configs/constants/app.constant";

/**
 * @class
 * Base error class that extends the Error module.
 * Last updated at: November 07, 2025
 * @author Jaybee Updated by Jerick
 */
export class BaseError extends Error{
    constructor(
        message: string,
        public readonly http_status_code: number,
        public readonly error_code: string,
        public readonly error_type: string,
        public readonly title: string
    ){
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * @class
 * Custom error for business logic failures. Example: throw new BusinessLogicError("User already exists")
 * Last updated at: November 07, 2025
 * @author Jaybee Updated by Jerick
 */
export class BusinessLogicError extends BaseError{
    constructor(message: string, http_status_code: number = RESPONSE_STATUS.client_error){
        super(
            message,
            http_status_code,
            STATUS_CODE.invalid.business_logic_error,
            'business_logic_error',
            'Business Logic Error'
        );
    }
}

/**
 * @class
 * Custom error for database-related failures. Example: throw new DatabaseError("Failed to connect to database")
 * Last updated at: November 07, 2025
 * @author Jaybee Updated by Jerick
 */
export class DatabaseError extends BaseError{
    constructor(message: string, http_status_code: number = RESPONSE_STATUS.server_error){
        super(
            message,
            http_status_code,
            STATUS_CODE.invalid.database_error,
            'database_error',
            'Database Error'
        );
    }
}

/**
 * @class
 * Custom error for validation failures. Example: throw new ValidationError("Invalid email format")
 * Last updated at: November 07, 2025
 * @author Jaybee Updated by Jerick
 */
export class ValidationError extends BaseError{
    constructor(message: string, http_status_code: number = RESPONSE_STATUS.client_error){
        super(
            message,
            http_status_code,
            STATUS_CODE.invalid.validation_error,
            'validation_error',
            'Validation Error'
        );
    }
}

/**
 * This function is used to execute a function inside a try catch block method.<br>
 * Triggered by all validations and controllers in their router.<br>
 * Last updated at: Nov 5, 2025
 * @param executable - The function that needs to be wrapped with try catch. 
 * @param req 
 * @param res
 * @param NextFunction
 * @author Jaybee
 */
export const exec = (executable: RequestHandler): RequestHandler => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try{
            await executable(req, res, next);
        } 
        catch(error){
            return next(error);
        }
    }
}

/**
 * DOCU: Global response formatter that standardizes all API responses
 * Triggered by controllers, validators, and error handlers
 * Last updated at: Nov 5, 2025
 * @param options - Configuration object for the response type
 * @returns Formatted response object with consistent structure
 * @author Jaybee
 * 
 * @example Success Response
 * formatResponse({
 *   type: 'success',
 *   code: 200,
 *   result: { id: 1, name: 'John' }
 * })
 * 
 * @example Validation Error
 * formatResponse({
 *   type: 'validation_error',
 *   code: 400,
 *   errors: { email: 'Invalid email format' }
 * })
 * 
 * @example Business Logic Error
 * formatResponse({
 *   type: 'business_logic_error',
 *   code: 400,
 *   title: 'User Creation Failed',
 *   message: 'A user with this email already exists',
 *   error: error
 * })
 */
export const formatResponse = <GenericResponse = unknown>(options: FormatResponseParams<GenericResponse>): FormattedResponse<GenericResponse> => {
    /* Handle success */
    if(options.type === 'success'){
        return {
            code: options.code,
            result: options.result
        } as SuccessResponse<GenericResponse>;
    }
    else{
        /* Handle validation errors from Zod */
        if(options.type === 'validation_error'){
            return {
                code: options.code,
                error: {
                    title: "Validation Error",
                    message: "An error encountered while validating your request payload.",
                    ...(SHOW_ERROR_DETAILS ? { details: options.errors } : {})
                }
            } as ErrorResponse;
        }

        /* Handle all other error types (business_logic_error, database_error, custom_error, jwt_web_token_error, error) */
        return {
            code: options.code,
            error: {
                title: options.title,
                message: options.message,
                ...(SHOW_ERROR_DETAILS && options.error ? { 
                    details: options.error instanceof Error 
                        ? {
                            name: options.error.name,
                            message: options.error.message,
                            ...(options.error.stack ? { stack: options.error.stack } : {})
                        }
                        : options.error 
                } : {})
            }
        } as ErrorResponse;
    }
};

