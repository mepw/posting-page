import DatabaseModel from "./database.model";
import format from "pg-format"
import { CreateTopic } from "../entities/types/topic.type";
import { SelectQueryInterface } from "../entities/interfaces/model.interface"
import { QueryResultRow } from 'pg';
import { NUMBERS } from "../../../configs/constants/number.constants"
const USE_READ_REPLICA = false;

class PostComment extends DatabaseModel{
    /**
     * DOCU: This function inserts a new comment into the database. 
     *       It formats the SQL insert statement with the provided comment data,
     *       executes the query, and returns the inserted comment ID along with the user ID. 
     * Last updated at: Nov 20, 2025 
     * @param post_comments - Object containing user_id, post_id, and comment text
     * @returns Object containing user_id (optional) and comment_id of the newly inserted comment
     * @author Keith
     */
    createNewTopic = async (creat_post_topic: CreateTopic): Promise<{ topic_id: number, user_id?: number }> => {
        const user_post = [[creat_post_topic.user_id, creat_post_topic.name]];

        const insert_creat_post_topic = format(`
                INSERT INTO user_stories.topics (user_id, name)
                VALUES %L
                RETURNING *;
            `, user_post
        );

        const result = await this.executeQuery<{ id: number }>(insert_creat_post_topic);
        return { topic_id: result.rows[0]?.id, user_id: result.rows[0]?.id };
    };
    
    /**
     * DOCU: This function fetches topics from the `user_stories.topics` table. 
     *       It dynamically constructs a SQL SELECT query based on the provided parameters,
     *       including optional joins, filtering, grouping, ordering, limiting, offsetting, 
     *       and Common Table Expressions (CTEs). 
     *       The query is executed using a read replica by default. 
     * Last updated at: Dec 3, 2025 
     * @template FetchFieldType - Type of the returned query row, extending QueryResultRow
     * @param params - Object containing optional query parameters:
     *                 fields_to_select: string of columns to select (default "*")
     *                 join_statement: SQL JOIN clause
     *                 where_params: SQL WHERE clause
     *                 where_values: Array of values for WHERE placeholders
     *                 group_by: SQL GROUP BY clause
     *                 order_by: SQL ORDER BY clause
     *                 limit: Maximum number of rows to return
     *                 offset: Number of rows to skip
     *                 cte: Common Table Expression (WITH clause)
     * @returns Object containing `new_topics`, an array of rows matching the query
     * @author Keith
     */
    fetchModel = async <FetchFieldType extends QueryResultRow>(params: SelectQueryInterface = {}): Promise<{ new_topics: FetchFieldType[] }> => {
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
            FROM user_stories.topics
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
        return { new_topics: result.rows };
    };

    /**
     * DOCU: This function deletes topics from the `user_stories.topics` table. 
     *       It constructs a SQL DELETE statement using the provided WHERE clause and values,
     *       executes the query, and returns a boolean indicating whether any rows were deleted. 
     * Last updated at: Dec 3, 2025 
     * @param where_params - SQL WHERE clause string to identify which topics to delete
     * @param where_values - Array of values for the WHERE clause placeholders
     * @returns Boolean indicating whether at least one row was deleted (true) or not (false)
     * @author Keith
     */
    deleteTopic = async (where_params: string, where_values: (string | number | boolean | Date)[] = []): Promise<boolean> => {
        const delete_user_post = await this.executeQuery(`
                DELETE 
                FROM user_stories.topics 
                WHERE ${where_params}
            `, where_values
        );

        return !!delete_user_post.rowCount;
    };
}

export default PostComment;