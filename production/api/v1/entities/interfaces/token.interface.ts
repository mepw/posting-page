import jwt from "jsonwebtoken";

export interface UserTokenDataInterface extends jwt.JwtPayload {
    id: number;
    user_account_type_id: number;
}
