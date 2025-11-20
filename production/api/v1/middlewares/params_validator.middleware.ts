/* Vendor modules */
import { Request, Response, NextFunction } from "express-serve-static-core";
import { ZodSchema } from "zod";

/* Helpers */
import { formatResponse } from "../helpers/global.helper";

/* Constants */
import { STATUS_CODE } from "../../../configs/constants/api_request.constants";
import { RESPONSE_STATUS } from "../../../configs/constants/app.constant";

/* Extend Express Request interface for custom field */
declare module "express-serve-static-core" {
    interface Request {
        validated_data?: unknown;
    }
}

/**
 * DOCU: Middleware that validates request parameters using a schema set with Zod validator.
 * Triggered by all requests.
 * Last updated at: November 07, 2025
 * @param paramSchema
 * @param req
 * @param res
 * @param next
 * @author Jaybee Updated by Jerick & Kirt
 */
export const paramsValidator = (paramSchema: ZodSchema<unknown>) => {
    return (req: Request, res: Response, next: NextFunction) => {

        const validation_result = paramSchema.safeParse({ ...req.query, ...req.params, ...req.body });

        if(validation_result.success){
            /* Set the request parameters data to req.validated so that it can be reused in controller */
            req.validated_data = validation_result.data;
            return next();
        }
        else{
            const validation_errors: { [key: string]: string } = {};

            /* Reformat error object from Zod */
            for(const idx in validation_result.error.issues){
                const this_error = validation_result.error.issues[idx];
                const [first_error] = this_error.path;
                
                validation_errors[first_error] = this_error.message;
            }

            return res.status(RESPONSE_STATUS.client_error).json(formatResponse({
                type: 'validation_error',
                code: STATUS_CODE.invalid.validation_error,
                errors: validation_errors
            }));
        }
    }
}