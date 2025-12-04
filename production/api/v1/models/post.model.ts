import DatabaseModel from "./database.model";
import { SelectQueryInterface } from "../entities/interfaces/model.interface"
import { QueryResultRow } from 'pg';
import format from "pg-format"
import { CreatePostType } from "../entities/types/post.type";
import { NUMBERS } from "../../../configs/constants/number.constants"
const USE_READ_REPLICA = false;

class PostModel extends DatabaseModel {
    /**
     * DOCU: This function fetches posts from the database with optional filtering, joining, grouping, ordering, and pagination. 
     *       It constructs a dynamic SQL query based on provided parameters and returns the result rows. 
     * Last updated at: Nov 20, 2025 
     * @param params - Object containing select fields, join statements, where clauses, group/order clauses, limit, offset, and CTE
     * @returns Object containing an array of posts matching the query
     * @template FetchFieldType - Type of each post row returned from the query
     * @author Keith
     */
    fetchModel = async <FetchFieldType extends QueryResultRow>(params: SelectQueryInterface = {}): Promise<{ new_user_post: FetchFieldType[] }> => {
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
        FROM user_stories.posts
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
        return { new_user_post: result.rows };
    };

    /**
     * DOCU: This function inserts a new post into the database. 
     *       It formats the SQL insert statement with the provided post details,
     *       executes the query, and returns the inserted post ID. 
     * Last updated at: Nov 20, 2025 
     * @param post_details - Object containing user_id, title, and description
     * @returns Object containing the newly inserted post ID as title_id
     * @author Keith
     */
    createNewPost = async (post_details: CreatePostType): Promise<CreatePostType & { post_id: number }> => {
        const user_post = [[ post_details.user_id, post_details.title, post_details.description, post_details.post_topic_id, post_details.post_sub_topic_id, ] ];
        
        const insert_post_details = format(`
                INSERT INTO user_stories.posts (user_id, title, description, topic_id, sub_topic_id)
                VALUES %L
                RETURNING *;
            `, user_post
        );

        const result = await this.executeQuery<{ id: number; user_id: number; title: string; description: string; post_topic_id: number; post_sub_topic_id: number | null; post_details: string | null }>(insert_post_details);
        const row = result.rows[0];
        return{ post_id: row.id, user_id: row.user_id, title: row.title, description: row.description, post_topic_id: row.post_topic_id, post_sub_topic_id: row.post_sub_topic_id, };
    };

    /**
     * DOCU: This function updates an existing post. 
     *       It executes an update query with the provided set and where clauses and values, and returns a boolean indicating success. 
     * Last updated at: Nov 20, 2025 
     * @param set_fields - SQL SET clause string
     * @param where_params - SQL WHERE clause string
     * @param set_values - Array of values corresponding to the SET clause
     * @param where_values - Array of values corresponding to the WHERE clause
     * @returns boolean - True if the update affected rows, false otherwise
     * @author Keith
     */
    updateUserPost = async (set_fields: string, where_params: string, set_values: (string | number | boolean | Date)[], where_values: (string | number | boolean | Date)[] = []): Promise<boolean> => {
        let update_user_result = await this.executeQuery(`
            UPDATE user_stories.posts 
            SET ${set_fields} 
            WHERE ${where_params}
        `, [...set_values, ...where_values]);

        return !!update_user_result.rowCount;
    };

    /**
     * DOCU: This function deletes posts matching the provided WHERE clause. 
     *       It executes a DELETE query and returns a boolean indicating whether any rows were deleted. 
     * Last updated at: Nov 20, 2025 
     * @param where_params - SQL WHERE clause string
     * @param where_values - Array of values corresponding to the WHERE clause
     * @returns boolean - True if deletion affected rows, false otherwise
     * @author Keith
     */
    deletePost = async (where_params: string, where_values: (string | number | boolean | Date)[] = []): Promise<boolean> => {
        const delete_user_post = await this.executeQuery(`
                DELETE 
                FROM user_stories.posts 
                WHERE ${where_params}
            `, where_values
        );

        return !!delete_user_post.rowCount;
    };

}

export default PostModel;