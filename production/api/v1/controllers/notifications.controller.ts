import { Request, Response } from "express-serve-static-core";
import { RESPONSE_DATA_DEFAULT_VALUE } from "../../../configs/constants/app.constant";
import NotificationService from "../services/notification.service";
class NotificationsController{
    /**
     * DOCU: Get all notifications
     * @param req Request
     * @param res Response
     * @returns void
     * Last updated at: December 08, 2025
     * @author Keith
     */
    getAllNotifications = async (req: Request, res: Response): Promise<void> => {
        try{            
            const notification_service = new NotificationService();
            const response_data = await notification_service.getAllNotifications();
            res.json(response_data);
        }
        catch(error){
            res.json({ ...RESPONSE_DATA_DEFAULT_VALUE, error: (error as Error).message || 'error in getting notification', });
        }
    };

    /** 
     * DOCU: Get notification by user id 
     * @param req Request
     * @param res Response
     * @returns void
     * Last updated at: December 08, 2025
     * @author Keith
    */
    getNotificationByUserId = async (req: Request, res: Response): Promise<void> => {
        try{            
            const notification_service = new NotificationService();
            const response_data = await notification_service.getSingleNotification({...req.body, id: req.params.id, user_id: req.validated_user_data?.id! });
            res.json(response_data);
        }
        catch(error){
            res.json({ ...RESPONSE_DATA_DEFAULT_VALUE, error: (error as Error).message || 'error in getting notification', });
        }
    };

    /** 
     * DOCU: Update notification by user id
     * @param req Request
     * @param res Response
     * @returns void
     * Last updated at: December 08, 2025
     * @author Keith
     */
    updateNotification = async (req: Request, res: Response): Promise<void> => {
        try{            
            const notification_service = new NotificationService();
            const response_data = await notification_service.updateNotification({...req.body, id: req.params.id, user_id: req.validated_user_data?.id! });
            res.json(response_data);
        }
        catch(error){
            res.json({ ...RESPONSE_DATA_DEFAULT_VALUE, error: (error as Error).message || 'error in updating notification', });
        }
    }
}
export default new NotificationsController();
