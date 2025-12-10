import DatabaseModel from "../models/database.model";
import { ResponseDataInterface } from "../entities/interfaces/global.interface";
import Notfication from "../models/notification.model";
import { Notifications } from "../entities/types/notification.type";

class notificationService extends DatabaseModel {
    /** DOCU: 
     * This function retrieves all notifications by calling the Notification model. 
     * It returns the response data as JSON. If an error occurs, it returns a default
     * error response with the error message.
     * Last updated at: December 08, 2025
     * @returns response_data - JSON containing status, result (array of notifications), and/or error message
     * @author Keith 
     */
    getAllNotifications = async (): Promise<ResponseDataInterface<Notifications[]>> => {
        const response_data: ResponseDataInterface<Notifications[]> = { status: false, error: null, result: undefined };
            
        try{
            const notifications = new Notfication();
            const notification_result = await notifications.fetchModel<Notifications>({
                fields_to_select: `*`,
            });
            
            if(!notification_result.notifications.length){
                throw new Error("No Notifications found.");
            }
            else{
                response_data.status = true;
                response_data.result = notification_result.notifications;
            }
        }
        catch(error){
            response_data.error = (error as Error).message || 'error in service get all notifications';
        }

        return response_data;
    };

    /**
     * DOCU:
     * This function retrieves a single notification by calling the Notification model.
     * It returns the response data as JSON. If an error occurs, it returns a default
     * error response with the error message.
     * @returns response_data - JSON containing status, result (array of notifications), and/or error message
     * Last updated at: December 08, 2025
     * @author Keith 
    */
    getSingleNotification = async (params: Notifications): Promise<ResponseDataInterface<Notifications>> => {
        const response_data: ResponseDataInterface<Notifications> = { status: false, error: null, result: undefined };
        
        try{
            const notifications = new Notfication();
            const notification_result = await notifications.fetchModel<Notifications>({
                fields_to_select: `*`,
                where_params: `id = $1`,
                where_values: [params.user_id],
            });
            
            if(!notification_result.notifications.length){
                throw new Error("No Notifications found for this user.");
            }
            else{
                response_data.status = true;
                response_data.result = notification_result.notifications[0];
            }
        }
        catch(error){
            response_data.error = (error as Error).message || 'error in service get user notifications';
        }

        return response_data;
    };

    /** 
     * DOCU: 
     * This function updates a notification by calling the Notification model. 
     * It returns the response data as JSON. If an error occurs, it returns a default
     * error response with the error message.
     * @returns response_data - JSON containing status, result (array of notifications), and/or error message
     * Last updated at: December 08, 2025
     * @author Keith
     */
    updateNotification = async (params: Notifications): Promise<ResponseDataInterface<Notifications>> => {
        const response_data: ResponseDataInterface<Notifications> = { status: false, error: null, result: undefined };

        try{
            const notifications = new Notfication();
            const update_notification_result = await notifications.updateNotifications(
                `context = $1, notification_status_id = $2`,
                'id = $5',
                [params.context, params.notification_status_id],
                [params.id]
            );

            if(!update_notification_result){
                throw new Error("Failed to update notification.");
            }
            else{
                response_data.status = true;
                response_data.result = params;
            }
        }
        catch(error){
            response_data.error = (error as Error).message || 'error in service update notification';
        }

        return response_data;
    };
}

export default notificationService;