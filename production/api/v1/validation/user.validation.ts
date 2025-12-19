import { string, z } from 'zod'
import { Request, Response, NextFunction } from "express-serve-static-core";
import { checkFieldHandler } from "../helpers/user_helper";

export const validateSignUpUser = (req: Request, res: Response, next: NextFunction) => {
    const sign_up_user_schema = z.object({
        first_name: z.string().regex(/^[a-zA-Z\s]+$/, { message: "First name must only contain letters." }),
        last_name: z.string().regex(/^[a-zA-Z\s]+$/, { message: "Last name must only contain letters." }),
        email: z.string().email({ message: "Invalid email address." }),
        password: z.string().min(6, { message: "Password must be at least 6 characters long." }),
        hobbies: z.array(z.string()),
    });

    const validation_result = sign_up_user_schema.safeParse(req.body);
    checkFieldHandler<z.infer<typeof sign_up_user_schema>>(validation_result, req, res, next);
};

export const validateVerifyLogin = (req: Request, res: Response, next: NextFunction) => {
    const verify_login_schema = z.object({
        email: z.string().email(),
        password: z.string()
    });
    const verify_login_validation_result = verify_login_schema.safeParse(req.body);

    /* Check if parameters from client are correct then proceed */
    checkFieldHandler<z.infer<typeof verify_login_schema>>(verify_login_validation_result, req, res, next);
};




