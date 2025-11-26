import { string, z } from 'zod'
import { Request, Response, NextFunction } from "express-serve-static-core";
import { REGEX } from "../../../configs/constants/user_validation.constant";
import { checkFieldHandler } from "../helpers/user_helper";

export const subTopicValidation = (req: Request, res: Response, next: NextFunction) => {
    const sub_topic_validation = z.object({
        name: z.string().regex(REGEX.name_format, { message: "Topic Name must be Text" }),
        post_topic_id: z.number(),
    });
    
    const validation_result = sub_topic_validation.safeParse(req.body);
    checkFieldHandler<z.infer<typeof sub_topic_validation>>(validation_result, req, res, next);
};





