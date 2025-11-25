/* Vendors */
import { NextFunction, Request, Response } from "express-serve-static-core";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { verifyJWTAuthToken } from "../helpers/jwt.helper";
/* Helpers */

/* Constants */
import { AUTHENTICATION_ERROR_MESSAGES } from "../../../configs/constants/api_request.constants";
import { JWT as jwt_credentials } from "../../../configs/constants/env.constant";

/* Entities */
import { ValidatedUserDataType } from "../entities/types/token.type";

/* Extend Express Request interface for custom field */
declare module "express-serve-static-core" {
    interface Request {
        validated_user_data?: ValidatedUserDataType;
    }
}

/**
 * DOCU: This function will verify if the user auth jwt is valid
 * Trigger: authenticatorHandler function
 * @param token - string
 * @returns user_data - jwt.JwtPayload
 * Last updated at: Nov 11, 2025
 * @author Jaybee
 */
export async function verifyUserToken(token: string): Promise<jwt.JwtPayload> {
    return new Promise((resolve, reject) => {
        jwt.verify(token, jwt_credentials.secretKey, { issuer: jwt_credentials.options.issuer }, (error, user_data) => {
            if (error || !user_data) {
                return reject(
                    new JsonWebTokenError(
                        error?.name === "TokenExpiredError"
                            ? AUTHENTICATION_ERROR_MESSAGES.token_expired
                            : AUTHENTICATION_ERROR_MESSAGES.incorrect_token
                    )
                );
            }
            resolve(user_data as jwt.JwtPayload);
        });
    });
}

/**
 * DOCU: This function will process the authentication of provided headers or token.
 * Trigger: server.ts
 * @param {Request} req - Request object of the client
 * @param {Response} res - Response object of the client
 * @param {NextFunction} next - NextFunction
 * Last updated at: November 07, 2025
 * @author Jaybee Updated by Jerick & Kirt
 */
export const authenticatorHandler = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization || "";
    const [bearer, token] = authHeader.split(" ");

    try{
        if(bearer !== "Bearer" || !token){
            throw new JsonWebTokenError(AUTHENTICATION_ERROR_MESSAGES.empty_token);
        }

        const verify_result = await verifyJWTAuthToken<ValidatedUserDataType>(token, true);

        if(!verify_result.status || !verify_result.result?.token){
            throw new JsonWebTokenError(verify_result.error || AUTHENTICATION_ERROR_MESSAGES.incorrect_token);
        }

        req.validated_user_data = verify_result.result.token;

        next();
    } 
    catch(error){
        next(error);
    }
};
