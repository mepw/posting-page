import { string, z } from 'zod'
import { Request, Response, NextFunction } from "express-serve-static-core";
import { REGEX } from "../../../configs/constants/user_validation.constant";
import { checkFieldHandler } from "../helpers/user_helper";

export const postValidation = (req: Request, res: Response, next: NextFunction) => {
    const post_validation = z.object({
        title: z.string().regex(REGEX.name_format, { message: "Title must be Text" }),
        description: z.string().regex(REGEX.name_format, { message: "Description must be text" }),
        post_topic_id: z.number().nullable(),    
        post_sub_topic_id: z.number().nullable(),
        post_details: z.string().nullable(),
    });

    const validation_result = post_validation.safeParse(req.body);
    checkFieldHandler<z.infer<typeof post_validation>>(validation_result, req, res, next);
};





