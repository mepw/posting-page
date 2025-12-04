import DatabaseModel from "./database.model";
import format from "pg-format"
import { CreateSubTopic } from "../entities/types/sub_topic.type";
import { SelectQueryInterface } from "../entities/interfaces/model.interface"
import { QueryResultRow } from 'pg';
import { NUMBERS } from "../../../configs/constants/number.constants";
const USE_READ_REPLICA = false;
class PostComment extends DatabaseModel {
    /**
     * DOCU: This function inserts a new comment into the database. 
     *       It formats the SQL insert statement with the provided comment data,
     *       executes the query, and returns the inserted comment ID along with the user ID. 
     * Last updated at: Nov 20, 2025 
     * @param post_comments - Object containing user_id, post_id, and comment text
     * @returns Object containing user_id (optional) and comment_id of the newly inserted comment
     * @author Keith
     */
    createNewSubTopic = async (post_sub_topic: CreateSubTopic): Promise<{ user_id?: number, sub_topic_id: number }> => {
        const post_sub_topics = [[post_sub_topic.user_id, post_sub_topic.topic_id, post_sub_topic.name]];

        const insert_post_comments = format(`
                INSERT INTO user_stories.sub_topics(user_id, topic_id, name)
                VALUES %L
                RETURNING id;
            `, post_sub_topics
        );

        const post_comment_result = await this.executeQuery<{ id: number }>(insert_post_comments);
        return { user_id: post_comment_result.rows[0]?.id, sub_topic_id: post_comment_result.rows[0]?.id };
    };
    
    /**
     * DOCU: This function fetches records from the `user_stories.sub_topics` table.
     *       It dynamically constructs the SQL SELECT query based on the provided parameters,
     *       including optional joins, where clauses, grouping, ordering, limits, offsets, and CTEs. 
     *       The query is executed against the database and the resulting rows are returned. 
     * Last updated at: Dec 3, 2025 
     * @template FetchFieldType - The type of the rows to fetch, extending QueryResultRow
     * @param params - Optional object to customize the query:
     *                 - fields_to_select: string of columns to select (default: "*")
     *                 - join_statement: string for JOIN clauses
     *                 - where_params: string representing WHERE conditions
     *                 - where_values: array of values for WHERE clause placeholders
     *                 - group_by: string for GROUP BY clause
     *                 - order_by: string for ORDER BY clause
     *                 - limit: number of rows to fetch
     *                 - offset: number of rows to skip
     *                 - cte: string for Common Table Expressions (WITH clause)
     * @returns Object containing a `posts` array of the fetched rows
     * @author Keith
     */
    fetchModel = async <FetchFieldType extends QueryResultRow>(params: SelectQueryInterface = {}): Promise<{ posts: FetchFieldType[] }> => {
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
        FROM user_stories.sub_topics
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
        return { posts: result.rows };
    };
    
    /**
     * DOCU: This function deletes records from the `user_stories.sub_topics` table
     *       based on the specified WHERE conditions and their corresponding values. 
     *       It executes a DELETE SQL query and returns a boolean indicating whether
     *       any rows were deleted. 
     * Last updated at: Dec 3, 2025 
     * @param where_params - String representing the WHERE clause conditions (e.g., "id = $1")
     * @param where_values - Array of values to replace placeholders in the WHERE clause
     * @returns Boolean indicating if any rows were deleted (true) or not (false) 
     * @author Keith
     */
    deleteSubTopic = async (where_params: string, where_values: (string | number | boolean | Date)[] = []): Promise<boolean> => {
        const delete_user_post = await this.executeQuery(`
                DELETE 
                FROM user_stories.sub_topics 
                WHERE ${where_params}
            `, where_values
        );

        return !!delete_user_post.rowCount;
    };
}

export default PostComment;