import { string, z } from 'zod'
import { Request, Response, NextFunction } from "express-serve-static-core";
import { REGEX } from "../../../configs/constants/user_validation.constant";
import { checkFieldHandler } from "../helpers/user_helper";

export const commentValidation = (req: Request, res: Response, next: NextFunction) => {
    const post_validation = z.object({
        comment: z.string().regex(REGEX.name_format, { message: "Comment must be Text" })
    });
    
    const validation_result = post_validation.safeParse(req.body);
    checkFieldHandler<z.infer<typeof post_validation>>(validation_result, req, res, next);
};





