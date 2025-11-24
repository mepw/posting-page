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
    /**
     * DOCU: This function handles user sign-up. <br>
     *       It validates the password, hashes it, checks for existing users,
     *       creates a new user record via UserModel, and returns the created user along with status. <br>
     * Last updated at: Nov 20, 2025 <br>
     * @param params - Object containing user sign-up data (first_name, last_name, email, password, etc.)
     * @returns response_data - JSON containing status, created user result, and/or error message
     * @author Keith
     */
    signUpUser = async (params: CreateUserParamsTypes): Promise<ResponseDataInterface<CreateUserParamsTypes>> => {
        const response_data: ResponseDataInterface<CreateUserParamsTypes> = { status: false, error: null, result: undefined };

        try {
            const new_user = { ...params, user_level_id: 2 };

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
    /**
     * DOCU: This function handles user login. <br>
     *       It fetches the user by email, validates the password, generates access and refresh JWT tokens,
     *       and returns them along with status. <br>
     * Last updated at: Nov 20, 2025 <br>
     * @param params - Object containing login credentials (email, password)
     * @returns response_data - JSON containing status, login result (access_token, refresh_token), and/or error message
     * @author Keith
     */
    userLogin = async (params: VerifyLoginParamsTypes): Promise<ResponseDataInterface<LoginResponseType>> => {
        const response_data: ResponseDataInterface<LoginResponseType> = { status: false, error: null, result: undefined };

        try {
            const userModel = new UserModel();

            const { users: [user] } = await userModel.fetchUser<CreateUserParamsTypes>({
                fields_to_select: `*`,
                where_params: `email = $1`,
                where_values: [params.email]
            });

            if(!user){
                response_data.error = "No user credentials Found";
                return response_data;
            }

            const password_match = await bcrypt.compare(params.password, user.password!);

            if(!password_match){
                response_data.error = "Password not match to user email";
                return response_data;
            }

            if(!JWT || !JWT.access || !JWT.refresh){
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
        catch(error: any){
            response_data.error = error.message;
        }

        return response_data;
    };
    /**
     * DOCU: This function retrieves user details by user ID. <br>
     *       It calls the UserModel to fetch the user and returns the user data along with status. <br>
     * Last updated at: Nov 20, 2025 <br>
     * @param user_id - ID of the user to retrieve
     * @returns response_data - JSON containing status, user data (or null), and/or error message
     * @author Keith
     */
    getUserById = async (user_id: number): Promise<ResponseDataInterface<CreateUserParamsTypes | null>> => {
        const response_data: ResponseDataInterface<CreateUserParamsTypes | null> = { status: false, error: null, result: undefined };

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
    /**
     * DOCU: This function refreshes JWT tokens for a user. <br>
     *       It fetches the user by ID, generates new access and refresh tokens, and returns them along with status. <br>
     * Last updated at: Nov 20, 2025 <br>
     * @param params - Object containing user ID
     * @returns response_data - JSON containing status, refreshed login tokens, and/or error message
     * @author Keith
     */
    refreshToken = async (params: { id: number }): Promise<ResponseDataInterface<LoginResponseType>> => {
        const response_data: ResponseDataInterface<LoginResponseType> = { status: false, error: null, result: undefined };

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
