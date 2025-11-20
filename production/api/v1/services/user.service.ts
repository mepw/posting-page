import bcrypt from "bcryptjs";

import { ResponseDataInterface } from "../entities/interfaces/global.interface";
import { CreateUserParamsTypes, VerifyLoginParamsTypes } from "../entities/types/user.type";
import UserModel from "../models/user.model";
import DatabaseModel from "../models/database.model";
import { LoginResponseType } from "../entities/types/session.type";
import { BCRYPT, JWT } from "../../../configs/constants/env.constant";
import { generateJWTAuthToken } from "../helpers/jwt.helper";
import { JWTUserPayload } from "../entities/types/user.type"

class UserService extends DatabaseModel {

    signUpUser = async (params: CreateUserParamsTypes): Promise<ResponseDataInterface<CreateUserParamsTypes>> => {
        const response_data: ResponseDataInterface<CreateUserParamsTypes> = { status: false, error: null, result: undefined };

        try {
            const new_user = { ...params };

            if (!new_user.password) {
                response_data.error = "Password is required.";
                return response_data;
            }

            new_user.password = await bcrypt.hash(new_user.password, 10);
            const user_model = new UserModel();

            const { users } = await user_model.fetchUser<{ id: number }>({
                fields_to_select: `id`,
                where_params: `email = $1`,
                where_values: [new_user.email]
            });

            if (users.length) {
                response_data.error = "User already exists.";
                return response_data;
            }

            const { user_id } = await user_model.createNewUserRecord(new_user);

            if (!user_id) {
                response_data.error = "Failed to create user record.";
                return response_data;
            }

            response_data.status = true;
            response_data.result = { ...new_user, id: user_id };
        }
        catch (error: any) {
            response_data.error = error.message;
        }

        return response_data;
    }

    userLogin = async (params: VerifyLoginParamsTypes): Promise<ResponseDataInterface<LoginResponseType>> => {
        const response_data: ResponseDataInterface<LoginResponseType> = {
            status: false,
            error: null,
            result: { access_token: "", refresh_token: "" }
        };

        try {
            const userModel = new UserModel();

            const { users: [user] } = await userModel.fetchUser<CreateUserParamsTypes>({
                fields_to_select: `id, first_name, last_name, email, password`,
                where_params: `email = $1`,
                where_values: [params.email]
            });

            if (!user) {
                response_data.error = "No user credentials Found";
                return response_data;
            }

            const password_match = await bcrypt.compare(params.password, user.password!);

            if (!password_match) {
                response_data.error = "Password not match to user email";
                return response_data;
            }

            if (!JWT || !JWT.access || !JWT.refresh) {
                throw new Error("JWT missing");
            }

            const { access, refresh } = JWT;

            const payload = {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email
            };

            response_data.status = true;
            response_data.result = {
                access_token: generateJWTAuthToken(payload, access),
                refresh_token: generateJWTAuthToken({ id: user.id } as JWTUserPayload, refresh)
            };
        }
        catch (error: any) {
            response_data.error = error.message;
        }

        return response_data;
    };

    getUserById = async (user_id: number): Promise<ResponseDataInterface<CreateUserParamsTypes | null>> => {
        const response_data: ResponseDataInterface<CreateUserParamsTypes | null> = {
            status: false,
            result: null,
            error: null,
        };

        try {
            const userModel = new UserModel();
            const { users } = await userModel.fetchUser<CreateUserParamsTypes>({
                where_params: "id = $1",
                where_values: [user_id],
            });

            if(users.length) {
                response_data.status = true;
                response_data.result = users[0];
            } 
            else {
                response_data.error = "User not found";
            }
        } 
        catch(error: any) {
            response_data.error = error.message;
        }

        return response_data;
    };

    refreshToken = async (params: { id: number }): Promise<ResponseDataInterface<LoginResponseType>> => {
        const response_data: ResponseDataInterface<LoginResponseType> = { status: false, error: null, result: { access_token: "", refresh_token: "" } };

        try {
            const userModel = new UserModel();
            const { users: [user] } = await userModel.fetchUser<CreateUserParamsTypes>({
                fields_to_select: "id, first_name, last_name, email",
                where_params: "id = $1",
                where_values: [params.id]
            });

            if (user?.id) {
                const { access, refresh } = JWT;

                response_data.status = true;
                response_data.result = {
                    /* Generate access and refresh tokens. */
                    access_token: generateJWTAuthToken({ ...user, password: undefined }, access),
                    refresh_token: generateJWTAuthToken({ id: user.id }, refresh),
                }
            }
            else {
                response_data.error = "User not found.";
            }
        }
        catch (error) {
            response_data.error = error;
        }

        return response_data;
    }


}

export default UserService;
