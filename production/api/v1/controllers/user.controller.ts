import { Request, Response } from "express-serve-static-core";
import UserService from "../services/user.service";
import { CreateUserParamsTypes } from "../entities/types/user.type";
import { RESPONSE_DATA_DEFAULT_VALUE } from "../../../configs/constants/app.constant";
import { ResponseDataInterface } from "../entities/interfaces/global.interface";
import { LoginResponseType } from "../entities/types/session.type";

class User extends UserService {

    userSignUp = async (req: Request, res: Response): Promise<void> => {
        const user_service = new UserService();

        try {
            const response_data: ResponseDataInterface<CreateUserParamsTypes> = await user_service.signUpUser(req.body as CreateUserParamsTypes);
            res.json(response_data);
        }
        catch (error: any) {
            res.json({ ...RESPONSE_DATA_DEFAULT_VALUE, status: false, error: error.message, });
        }
    };

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

    getUser = async (req: Request, res: Response): Promise<void> => {
        const user_id = req.validated_user_data?.id; 

        if (!user_id) {
            res.json({ status: false, error: "Unauthorized", result: null });
            return;
        }

        try {
            const user_service = new UserService();
            const response_data: ResponseDataInterface<CreateUserParamsTypes | null> = await user_service.getUserById(user_id);
            res.json(response_data);
        } 
        catch(error: any){
            res.json({
                ...RESPONSE_DATA_DEFAULT_VALUE,
                status: false,
                error: error.message,
                result: null,
            });
        }
    };



    userLogout = async (req: Request, res: Response): Promise<void> => {
        /* for user logout */
    }
}

export default new User();
