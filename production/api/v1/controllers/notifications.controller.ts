import { Request, Response } from "express-serve-static-core";
class NotificationsController {

    getAllNotifications = async (req: Request, res: Response): Promise<void> => {
        try{
            if(!req.validated_user_data?.id){
                throw new Error("User ID not found");
            }
            // const user_service = new UserService();
            // const response_data: ResponseDataInterface<CreateUserParamsTypes> = await user_service.getUserById({ id: req.validated_user_data.id } as CreateUserParamsTypes);
            // res.json(response_data);
        }
        catch(error){
            // res.json({ ...RESPONSE_DATA_DEFAULT_VALUE, error: (error as Error).message || 'error in getting user', });
        }
    };
}
export default new NotificationsController();
