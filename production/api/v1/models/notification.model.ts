import DatabaseModel from "./database.model";
import { SelectQueryInterface } from "../entities/interfaces/model.interface"
import { QueryResultRow } from 'pg';
import format from "pg-format"
import { Notifications } from "../entities/types/notification.type";
import { NUMBERS } from "../../../configs/constants/number.constants"
const USE_READ_REPLICA = false;
class Notification extends DatabaseModel{
    /**
     * DOCU: This function retrieves notification records from the database.
     * Last Updated Date: << INSERT_DATE >>
     * @param {number} user_id - The ID of the user to retrieve notifications for.
     * @param {number} notification_status_id - The ID of the notification status to filter notifications by.
     * @param {number} limit - The maximum number of notifications to retrieve.
     * @param {number} offset - The number of notifications to skip before retrieving notifications.
     * @returns {Promise<Notifications[]>} An array of notification records.
     */
    fetchModel = async <FetchFieldType extends QueryResultRow>(params: SelectQueryInterface = {}): Promise<{ notifications: FetchFieldType[] }> => {
            const { fields_to_select, join_statement, where_params, where_values, group_by, order_by, limit, offset, cte } = params;
            let last_index = where_values?.length || NUMBERS.one;
            const join_clause = join_statement || "";
            const where_clause = where_params ? `WHERE ${where_params}` : "";
            const group_by_clause = group_by ? `GROUP BY ${group_by}` : "";
            const order_by_clause = order_by ? `ORDER BY ${order_by}` : "";
            const limit_clause = limit !== undefined ? `LIMIT $${last_index++}` : "";
            const offset_clause = offset !== undefined ? `OFFSET $${last_index}` : "";
            const query = `
            ${cte ? `WITH ${cte}` : ""}
            SELECT ${fields_to_select || "*"}
            FROM user_stories.notifications
            ${join_clause}
            ${where_clause}
            ${group_by_clause}
            ${order_by_clause}
            ${limit_clause}
            ${offset_clause}
        `;
    
        const values = where_values || [];

        if(limit !== undefined){
            values.push(limit);
        }

        if(offset !== undefined){
            values.push(offset);
        }
    
        const result = await this.executeQuery<FetchFieldType>(query, values, USE_READ_REPLICA);   
        return { notifications: result.rows };
    };
    
    /**
     * DOCU: This function updates a notification record in the database.
     * last Updated Date: December 08, 2025
     * @author Keith 
    */
    updateNotifications = async (set_fields: string, where_params: string, set_values: (string | number | boolean | Date)[], where_values: (string | number | boolean | Date)[] = []): Promise<boolean> => {
        let update_user_result = await this.executeQuery(`
            UPDATE user_stories.notifications 
            SET ${set_fields} 
            WHERE ${where_params}
        `, [...set_values, ...where_values]);

        return !!update_user_result.rowCount;
    };
}

export default Notification;