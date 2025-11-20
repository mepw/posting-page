/* Import for vendors */
import jwt, { SignOptions, VerifyErrors } from "jsonwebtoken";

/* Import for constants */
import { JWT } from "../../../configs/constants/env.constant";

/* Import for entities */
import { ResponseDataInterface } from "../entities/interfaces/request_response.interfaces";


import UsersService from "../services/user.service";
import { CreateUserParamsTypes } from "../entities/types/user.type";
import { TokenCredentialsTypes } from "../../../configs/constants/entities.constant";

/**
 * This function is used to verify the JWT authentication tokens.<br>
 * Triggered by authentication.middleware.ts<br>
 * @param signed_jwt
 * @param is_access_token
 * Last updated at: May 5, 2025
 * @author Jones
 */
export const verifyJWTAuthToken = async <T>(
    signed_jwt: string,
    is_access_token?: boolean
): Promise<ResponseDataInterface<{ token?: T; new_access_token?: string }>> => {
    const response: ResponseDataInterface<{ token?: T; new_access_token?: string }> = {
        status: false,
        error: null,
    };

    try {
        const secret_key = is_access_token ? JWT.access.secret_key : JWT.refresh.secret_key;

        const decoded = jwt.verify(signed_jwt, secret_key) as T; // ✅ cast once

        response.status = true;
        response.result = { token: decoded };
    } catch (err: any) {
        response.error = err.message;
    }

    return response;
};


/**
 * DOCU: This function is used to generate a JWT authentication token.<br>
 * Triggered by users.service.ts<br>
 * @param data
 * @param jwt_config
 * @returns JWT authentication token
 * Last updated at: May 5, 2025
 * @author Jones
 */
export const generateJWTAuthToken = <T extends object>(data: T, jwt_config: TokenCredentialsTypes) => {
    return jwt.sign({ ...data }, jwt_config.secret_key, { expiresIn: jwt_config.expires_in } as SignOptions);
}


