import { Request, Response } from "express-serve-static-core";
import UserService from "../services/user.service";
import { CreateUserParamsTypes } from "../entities/types/user.type";
import { RESPONSE_DATA_DEFAULT_VALUE } from "../../../configs/constants/app.constant";
import { ResponseDataInterface } from "../entities/interfaces/global.interface";
import { LoginResponseType } from "../entities/types/session.type";

class User extends UserService {
    /**
     * DOCU: This function handles user sign-up. <br>
     *       It sends the request body to the user service to create a new user
     *       and returns the response as JSON. <br>
     * Last updated at: Nov 20, 2025 <br>
     * @param req - Express Request object containing user sign-up data
     * @param res - Express Response object used to send the JSON response
     * @returns response_data - JSON containing status, created user data, and/or error message
     * @author Keith
     */
    userSignUp = async (req: Request, res: Response): Promise<void> => {
        const user_service = new UserService();

        try {
            const response_data: ResponseDataInterface<CreateUserParamsTypes> = await user_service.signUpUser(req.body as CreateUserParamsTypes);
            res.json(response_data);
        }
        catch (error: any){
            res.json({ ...RESPONSE_DATA_DEFAULT_VALUE, status: false, error: error.message, });
        }
    };

    /**
     * DOCU: This function handles user login. <br>
     *       It sends the request body to the user service for authentication
     *       and returns the login response as JSON. <br>
     * Last updated at: Nov 20, 2025 <br>
     * @param req - Express Request object containing login credentials
     * @param res - Express Response object used to send the JSON response
     * @returns response_data - JSON containing status, login result (token, user info), and/or error message
     * @author Keith
     */
    userLogIn = async (req: Request, res: Response): Promise<void> => {
        const user_service = new UserService();

        try {
            const response_data: ResponseDataInterface<LoginResponseType> = await user_service.userLogin(req.body as CreateUserParamsTypes);
            res.json(response_data);
        }
        catch (error: any) {
            res.json({ ...RESPONSE_DATA_DEFAULT_VALUE, status: false, error: error.message, });
        }
    };
    /**
     * DOCU: This function retrieves user details by their ID. <br>
     *       It verifies the validated user ID, calls the user service to fetch the user,
     *       and returns the response as JSON. <br>
     * Last updated at: Nov 20, 2025 <br>
     * @param req - Express Request object containing validated user data
     * @param res - Express Response object used to send the JSON response
     * @returns response_data - JSON containing status, user data (or null), and/or error message
     * @author Keith
     */
    getUser = async (req: Request, res: Response): Promise<void> => {
        const user_id = req.validated_user_data?.id; 

        if(!user_id){
          throw new Error("user not found");
        }

        try{
            const user_service = new UserService();
            const response_data: ResponseDataInterface<CreateUserParamsTypes | null> = await user_service.getUserById(user_id);
            res.json(response_data);
        } 
        catch(error: any){
            res.json({...RESPONSE_DATA_DEFAULT_VALUE, status: false, error: error.message, result: null,});
        }
    };

    userLogout = async (req: Request, res: Response): Promise<void> => {
        /* for user logout */
    }
}

export default new User();
