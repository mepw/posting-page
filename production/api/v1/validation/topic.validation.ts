import { string, z } from 'zod'
import { Request, Response, NextFunction } from "express-serve-static-core";
import { checkFieldHandler } from "../helpers/user_helper";

export const topicValidation = (req: Request, res: Response, next: NextFunction) => {
    const topic_validation = z.object({
        name: z.string().regex(/^[a-zA-Z\s]+$/, { message: "Sub Topic Name must be Text" }),
    });
    
    const validation_result = topic_validation.safeParse(req.body);
    checkFieldHandler<z.infer<typeof topic_validation>>(validation_result, req, res, next);
};





