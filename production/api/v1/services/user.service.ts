import bcrypt from "bcryptjs";
import { ResponseDataInterface } from "../entities/interfaces/global.interface";
import { CreateUserParamsTypes, VerifyLoginParamsTypes, LogoutParamsType, GetUserById} from "../entities/types/user.type";
import UserModel from "../models/user.model";
import DatabaseModel from "../models/database.model";
import { LoginResponseType } from "../entities/types/session.type";
import {  JWT } from "../../../configs/constants/env.constant";
import { generateJWTAuthToken } from "../helpers/jwt.helper";
import { JWTUserPayload } from "../entities/types/user.type"

class UserService extends DatabaseModel {
    /**
     * DOCU: This function handles user sign-up. 
     *       It validates the password, hashes it, checks for existing users,
     *       creates a new user record via UserModel, and returns the created user along with status. 
     * Last updated at: Nov 20, 2025 
     * @param params - Object containing user sign-up data (first_name, last_name, email, password, etc.)
     * @returns response_data - JSON containing status, created user result, and/or error message
     * @author Keith
     */
    signUpUser = async (params: CreateUserParamsTypes): Promise<ResponseDataInterface<CreateUserParamsTypes>> => {
        const response_data: ResponseDataInterface<CreateUserParamsTypes> = { status: false, error: null, result: undefined };
        
        try{
            const create_new_user = { ...params, user_level_id: 2 };

            if(!create_new_user.password) {
                throw new Error("Password is required.");
            }

            create_new_user.password = await bcrypt.hash(create_new_user.password, 10);
            const user_model = new UserModel();

            const { user_data } = await user_model.fetchUser<{ id: number }>({
                fields_to_select: `id`,
                where_params: `email = $1`,
                where_values: [create_new_user.email]
            });

            if(user_data.length){
                throw new Error("User with this email already exists.");
            }

            const { user_id } = await user_model.createNewUserRecord(create_new_user);

            if(user_id){
                response_data.status = true;
                response_data.result = { ...create_new_user, id: user_id };
            } 
            else{
                throw new Error("Failed to create user.");
            }
        }
        catch(error){
            response_data.error = (error as Error).message || 'error in service signupuser';
        }

        return response_data;
    }

    /**
     * DOCU: This function handles user login. 
     *       It fetches the user by email, validates the password, generates access and refresh JWT tokens,
     *       and returns them along with status. 
     * Last updated at: Nov 20, 2025 
     * @param params - Object containing login credentials (email, password)
     * @returns response_data - JSON containing status, login result (access_token, refresh_token), and/or error message
     * @author Keith
     */
    userLogin = async (params: VerifyLoginParamsTypes): Promise<ResponseDataInterface<LoginResponseType>> => {
        const response_data: ResponseDataInterface<LoginResponseType> = { status: false, error: null, result: undefined };

        try{
            const userModel = new UserModel();

            const { user_data: [user] } = await userModel.fetchUser<CreateUserParamsTypes>({
                fields_to_select: `*`,
                where_params: `email = $1`,
                where_values: [params.email]
            });

            if(!user){
                throw new Error("User not found");
            }

            const password_match = await bcrypt.compare(params.password, user.password!);

            if(!password_match){
                throw new Error("Password mismatch");
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
        catch(error){
            response_data.error = (error as Error).message || 'error in service userlogin';
        }

        return response_data;
    };

    /**
     * DOCU: This function retrieves user details by user ID. 
     *       It calls the UserModel to fetch the user and returns the user data along with status. 
     * Last updated at: Nov 20, 2025 
     * @param user_id - ID of the user to retrieve
     * @returns response_data - JSON containing status, user data (or null), and/or error message
     * @author Keith
     */
    getUserById = async (params: GetUserById): Promise<ResponseDataInterface<GetUserById>> => {
        const response_data: ResponseDataInterface<GetUserById> = { status: false, error: null, result: undefined };

        try{
            const user_model = new UserModel();
            const { user_data } = await user_model.fetchUser<GetUserById>({
                where_params: "id = $1",
                where_values: [params.id],
            });
            
            if(user_data.length){
                response_data.status = true;
                response_data.result = user_data[0];
            }
            else{
                throw new Error("User not found.");
            }
        }
        catch(error){
            response_data.error = (error as Error).message || 'error in service getuserbyid';
        }

        return response_data;
    };

    /**
     * DOCU: This function refreshes JWT tokens for a user. 
     *       It fetches the user by ID, generates new access and refresh tokens, and returns them along with status. 
     * Last updated at: Nov 20, 2025 
     * @param params - Object containing user ID
     * @returns response_data - JSON containing status, refreshed login tokens, and/or error message
     * @author Keith
     */
    refreshToken = async (params: CreateUserParamsTypes): Promise<ResponseDataInterface<LoginResponseType>> => {
        const response_data: ResponseDataInterface<LoginResponseType> = { status: false, error: null, result: undefined };

        try{
            const user_model = new UserModel();
            const { user_data: [user] } = await user_model.fetchUser<CreateUserParamsTypes>({
                fields_to_select: "id, first_name, last_name, email",
                where_params: "id = $1",
                where_values: [params.id]
            });

            if(user.id){
                const { access, refresh } = JWT;

                response_data.status = true;
                response_data.result = {
                    /* Generate access and refresh tokens. */
                    access_token: generateJWTAuthToken({ ...user, password: null }, access),
                    refresh_token: generateJWTAuthToken({ id: user.id }, refresh),
                }
            }
            else{
                throw new Error("User not found.");
            }
        }
        catch(error){
            response_data.error = (error as Error).message || 'error in service refreshtoken';
        }

        return response_data;
    }

    /**
    * DOCU: This function handles user logout. 
    *       It invalidates or clears the user’s active session/token and returns a logout status response. 
    * Last updated at: Nov 20, 2025 
    * @param params - Object containing user ID
    * @returns response_data - JSON containing status, logout confirmation, and/or error message
    * @author Keith
    */
    userLogOut = async (params: GetUserById): Promise<ResponseDataInterface<GetUserById>> => {
        const response_data: ResponseDataInterface<GetUserById> = { status: false, error: null, result: undefined };

        try{
            const user_model = new UserModel();
            const { user_data } = await user_model.fetchUser<GetUserById>({
                where_params: "id = $1",
                where_values: [params.id],
            });

            if(user_data.length){
                response_data.status = true;
                response_data.result = user_data[0];
            }
            else{   
                throw new Error("User not found.");
            }
        }
        catch(error){
            response_data.error = (error as Error).message || 'error in service getuserbyid';
        }

        return response_data;
    };


}

export default UserService;
