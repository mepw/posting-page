import { string, z } from 'zod'
import { Request, Response, NextFunction } from "express-serve-static-core";
import { checkFieldHandler } from "../helpers/user_helper";

export const subTopicValidation = (req: Request, res: Response, next: NextFunction) => {
    const sub_topic_validation = z.object({
        name: z.string().regex(/^[a-zA-Z\s]+$/, { message: "Sub-Topic Name must be Text" }),
        topic_id: z.number().nullable(),
    }); 
    
    const validation_result = sub_topic_validation.safeParse(req.body);
    checkFieldHandler<z.infer<typeof sub_topic_validation>>(validation_result, req, res, next);
};

