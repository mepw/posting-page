import { SelectQueryInterface } from "../entities/interfaces/model.interface"
import { Pool, QueryResultRow } from 'pg';
import { CreateUserParamsTypes } from "../entities/types/user.type"
import format from "pg-format";
import DatabaseModel from "./database.model";

class UserModel extends DatabaseModel {
    /**
     * DOCU: This function fetches users from the database. <br>
     *       It constructs a SELECT query based on optional fields and WHERE conditions,
     *       executes the query, and returns the resulting user rows. <br>
     * Last updated at: Nov 20, 2025 <br>
     * @param params - Optional object containing select fields and where clauses
     * @returns Object containing an array of users matching the query
     * @author Keith
     */
    fetchUser = async <FetchFieldType extends QueryResultRow>(
        params?: SelectQueryInterface): Promise<{ user_data: FetchFieldType[] }> => {
        const fields = params?.fields_to_select || '*';
        const whereClause = params?.where_params ? `WHERE ${params.where_params}` : '';

        const values = params?.where_values || [];
        const query = `SELECT ${fields} FROM user_stories.users ${whereClause}`;

        const result = await this.executeQuery<FetchFieldType>(query, values);

        return { user_data: result.rows };
    };

    /**
     * DOCU: This function inserts a new user record into the database. <br>
     *       It formats the SQL insert statement with provided user details, executes the query,
     *       and returns the newly inserted user ID. <br>
     * Last updated at: Nov 20, 2025 <br>
     * @param user_details - Object containing first_name, last_name, email, and hashed password
     * @returns Object containing the newly created user ID as user_id
     * @author Jaybee
     */
    createNewUserRecord = async (
        user_details: CreateUserParamsTypes): Promise<{ user_id?: number, user_level_id: number }> => {
        const user_values = [
            [
                user_details.first_name,
                user_details.last_name,
                user_details.email,
                user_details.password,
                user_details.user_level_id
            ]
        ];

        const insert_user_details = format(`
            INSERT INTO user_stories.users (first_name, last_name, email, password, user_level_id)
            VALUES %L
            RETURNING *;
            `, user_values
        );

        const result = await this.executeQuery<{ id: number}>(insert_user_details);

        return { user_id: result.rows[0]?.id, user_level_id: result.rows[0]?.id};
    };

    
}

export default UserModel;