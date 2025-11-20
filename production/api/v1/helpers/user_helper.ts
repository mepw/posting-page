/* Import for vendors */
import { NextFunction, Request, Response } from "express";

/* Imports for interfaces */
import { ZodResponseType } from "../entities/types/zod_response.type";

/**
 * This function is used to execute a function inside a try catch block method.<br>
 * Triggered by all validations and controllers in their router.<br>
 * Last updated at: May 2, 2025
 * @param executable - The function that needs to be wrapped with try catch. 
 * @param req 
 * @param res
 * @param NextFunction
 * @author Jones
 */
export const exec = (executable: (req: Request, res: Response, next: NextFunction) => void | Promise<void>) => async (req: Request, res: Response, next: NextFunction) => {
    try{
        await executable(req, res, next);
    }
    catch(error){
        return next(error);
    }
}

/**
 * Initial result checking for GlobalHelper.checkFields output.<br>
 * Triggered by most validations in the validation layer.<br>
 * Last updated at: May 2, 2025
 * @param check_fields - The result of GlobalHelper.checkFields. 
 * @param req 
 * @param res
 * @param NextFunction
 * @author Jones
 */
export const checkFieldHandler = <CheckFieldType>(checked_fields: ZodResponseType<CheckFieldType>, req: Request, res: Response, next: NextFunction) => {
    if(checked_fields.success && checked_fields.data){
        /* Set the checked_fields value back to req.body so that it can be reused in controller */
        req.body = checked_fields.data;
        next();
    }
    else{
        res.json({status: false, error: checked_fields.error});
    }
}