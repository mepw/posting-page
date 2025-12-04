import { Request, Response } from "express-serve-static-core";
import UserService from "../services/user.service";
import { CreateUserParamsTypes,} from "../entities/types/user.type";
import { RESPONSE_DATA_DEFAULT_VALUE } from "../../../configs/constants/app.constant";
import { ResponseDataInterface } from "../entities/interfaces/global.interface";
import { LoginResponseType } from "../entities/types/session.type";

class User extends UserService {

    /**
     * DOCU: This function handles user sign-up. 
     *       It sends the request body to the user service to create a new user
     *       and returns the response as JSON. 
     * Last updated at: Nov 20, 2025 
     * @param req - Express Request object containing user sign-up data
     * @param res - Express Response object used to send the JSON response
     * @returns response_data - JSON containing status, created user data, and/or error message
     * @author Keith
     */
    userSignUp = async (req: Request, res: Response): Promise<void> => {
        try{
            const user_service = new UserService();
            const response_data: ResponseDataInterface<CreateUserParamsTypes> = await user_service.signUpUser(req.body as CreateUserParamsTypes);
            res.json(response_data);
        }
        catch(error){
            res.json({ ...RESPONSE_DATA_DEFAULT_VALUE, error: (error as Error).message || 'error in signup', });
        }
        
    };

    /**
     * DOCU: This function handles user login. 
     *       It sends the request body to the user service for authentication
     *       and returns the login response as JSON. 
     * Last updated at: Nov 20, 2025 
     * @param req - Express Request object containing login credentials
     * @param res - Express Response object used to send the JSON response
     * @returns response_data - JSON containing status, login result (token, user info), and/or error message
     * @author Keith
     */
    userLogIn = async (req: Request, res: Response): Promise<void> => {

        try{
            const user_service = new UserService();
            const response_data: ResponseDataInterface<LoginResponseType> = await user_service.userLogin(req.body as CreateUserParamsTypes);
            res.json(response_data);
        }
        catch(error){
            res.json({ ...RESPONSE_DATA_DEFAULT_VALUE, error: (error as Error).message || 'error in login', });
        }

    };

    /**
     * DOCU: This function retrieves user details by their ID. 
     *       It verifies the validated user ID, calls the user service to fetch the user,
     *       and returns the response as JSON. 
     * Last updated at: Nov 20, 2025 
     * @param req - Express Request object containing validated user data
     * @param res - Express Response object used to send the JSON response
     * @returns response_data - JSON containing status, user data (or null), and/or error message
     * @author Keith
     */
    getUserId = async (req: Request, res: Response): Promise<void> => {
        
        try{
            if(!req.validated_user_data?.id){
                throw new Error("User ID not found");
            }
            
            const user_service = new UserService();
            const response_data: ResponseDataInterface<CreateUserParamsTypes> = await user_service.getUserById({ id: req.validated_user_data.id } as CreateUserParamsTypes);
            res.json(response_data);
        }
        catch(error){
            res.json({ ...RESPONSE_DATA_DEFAULT_VALUE, error:(error as Error).message || 'error in getting user', });
        }

    };

    /**
     * DOCU: Logout controller to process user logout requests. 
     *       This function extracts the authenticated user's ID from
     *       validated request data, triggers the logout service to
     *       invalidate the user's session or refresh token, and returns
     *       the result as a JSON response. 
     * Method: Controller Function 
     * Used in: POST /logout 
     * Last updated: Nov 20, 2025 
     * @param req - Express request object containing validated user data
     * @param res - Express response object used to send JSON response
     * @returns void - Sends a JSON response containing logout status and/or error message
     * @author Keith
     */
    logOutUser = async (req: Request, res: Response): Promise<void> => {
        
        try{
            if(!req.validated_user_data?.id){
                throw new Error("User ID not found");
            }
        
            const user_service = new UserService();
            const response_data: ResponseDataInterface<CreateUserParamsTypes> = await user_service.userLogOut({ id: req.validated_user_data.id } as CreateUserParamsTypes);
            res.json(response_data);
        } 
        catch(error){
            res.json({...RESPONSE_DATA_DEFAULT_VALUE,  error:(error as Error).message || 'error in logout',  });
        }

    };
    
    /**
    * DOCU: Edit user details controller to process requests for updating user information.
    *       This function extracts the authenticated user's ID from validated request data,
    *       calls the user service to edit the user details, and returns the result as a JSON response.
    * Method: Controller Function
    * Used in: PUT /users/edit (or your specific route)
    * Last updated: Dec 3, 2025
    * @param req - Express request object containing validated user data
    * @param res - Express response object used to send JSON response
    * @returns void - Sends a JSON response containing edited user data and/or error message
    * @author Keith
    */
    editUserDetails = async (req: Request, res: Response): Promise<void> => {
        
        try{
            
            if(!req.validated_user_data?.id){
                throw new Error("User ID not found");
            }
            
            const user_service = new UserService();
            const response_data: ResponseDataInterface<CreateUserParamsTypes> = await user_service.editUser({  
                id: req.validated_user_data.id,
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                password: req.body.password,
                user_level_id: req.body.user_level_id,
                hobbies: req.body.hobbies } as CreateUserParamsTypes
            );

            res.json(response_data);
        }
        catch(error){
            res.json({ ...RESPONSE_DATA_DEFAULT_VALUE, error: (error as Error).message || 'error in getting user', });
        }
    };

}

export default new User();
