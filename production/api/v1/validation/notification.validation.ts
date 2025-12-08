import { string, z } from 'zod'
import { Request, Response, NextFunction } from "express-serve-static-core";
import { checkFieldHandler } from "../helpers/user_helper";

export const NotificationsValidation = (req: Request, res: Response, next: NextFunction) => {
    const user_notification_validation = z.object({
        useer_id: z.number().nullable(),
    }); 
    
    const validation_result = user_notification_validation.safeParse(req.body);
    checkFieldHandler<z.infer<typeof user_notification_validation>>(validation_result, req, res, next);
};

