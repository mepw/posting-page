/* Vendors */
import { Request, Response, NextFunction } from "express-serve-static-core";
import { JsonWebTokenError } from "jsonwebtoken";

/* Helpers */
import { BaseError, formatResponse } from "../helpers/global.helper";

/* Entities (types, interfaces and schemas) */
import { FormatResponseParams, FormattedResponse } from "../entities/types/global.type";

/* Constants */
import { STATUS_CODE } from "../../../configs/constants/api_request.constants";
import { RESPONSE_STATUS } from "../../../configs/constants/app.constant";

/**
 * DOCU: Middleware that serves as global error handler for app server error / unhandled logics.
 * Triggered by try-catch block or exec helper.
 * Last updated at: November 07, 2025
 * @param err
 * @param req
 * @param res
 * @param next
 * @author Jaybee Updated by Jerick
 */
/* IMPORTANT NOTE: Don't remove the next parameter, it will broke your codes related to ZodError */ 
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
    const error_response: {status: number, data: FormattedResponse<unknown>} = {
        status: RESPONSE_STATUS.server_error,
        data: formatResponse({
            type: 'error',
            code: STATUS_CODE.invalid.internal_server_error,
            title: 'Internal Server Error',
            message: 'Something went wrong.',
            error: error
        })
    }

    /* Handle custom BaseError subclasses (BusinessLogicError, DatabaseError, ValidationError, CustomError) */
    if(error instanceof BaseError){
        error_response.status = error.http_status_code
        error_response.data = formatResponse({
            type: error.error_type,
            code: error.error_code,
            title: error.title,
            message: error.message,
            error: error
        } as FormatResponseParams);
    }

    /* Handle JWT errors */
    if(error instanceof JsonWebTokenError){
        error_response.status = RESPONSE_STATUS.unauthorized
        error_response.data = formatResponse({
            type: 'authentication_error',
            code: STATUS_CODE.invalid.unauthorized,
            title: 'Authentication Error',
            message: error.message,
            error: error
        });
    }
    /* Handle string errors */
    if(typeof error === "string"){
        error_response.status = RESPONSE_STATUS.server_error
        error_response.data = formatResponse({
            type: 'error',
            code: STATUS_CODE.invalid.internal_server_error,
            title: 'Error',
            message: error
        });
    }

    /* TODO: Optional Sentry Integration or any other logging service */
    // if(ENABLE_SENTRY){
    //     sentry.log(error_response.data)
    // }

    /* Fallback for unknown error types / Handle generic Error */
    return res.status(error_response.status).json(error_response.data);
}