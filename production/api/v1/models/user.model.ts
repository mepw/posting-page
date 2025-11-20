import { SelectQueryInterface } from "../entities/interfaces/model.interface"
import { Pool, QueryResultRow } from 'pg';
import { CreateUserParamsTypes } from "../entities/types/user.type"
import format from "pg-format";
import DatabaseModel from "./database.model";

class UserModel extends DatabaseModel {

    fetchUser = async <FetchFieldType extends QueryResultRow>(
        params?: SelectQueryInterface): Promise<{ users: FetchFieldType[] }> => {
        const fields = params?.fields_to_select || '*';
        const whereClause = params?.where_params ? `WHERE ${params.where_params}` : '';

        const values = params?.where_values || [];
        const query = `SELECT ${fields} FROM user_stories.users ${whereClause}`;

        const result = await this.executeQuery<FetchFieldType>(query, values);

        return { users: result.rows };
    };


    createNewUserRecord = async (
        user_details: CreateUserParamsTypes): Promise<{ user_id?: number }> => {
        const user_values = [
            [
                user_details.first_name,
                user_details.last_name,
                user_details.email,
                user_details.password
            ]
        ];

        const insert_user_details = format(`
            INSERT INTO user_stories.users (first_name, last_name, email, password)
            VALUES %L
            RETURNING *;
            `, user_values
        );

        const result = await this.executeQuery<{ id: number }>(insert_user_details);

        return { user_id: result.rows[0]?.id };
    };

    
}

export default UserModel;