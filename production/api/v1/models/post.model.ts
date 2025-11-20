import DatabaseModel from "./database.model";
import { SelectQueryInterface } from "../entities/interfaces/model.interface"
import { QueryResultRow } from 'pg';
import format from "pg-format"
import { CreatePostType } from "../entities/types/post.type";
import { NUMBERS } from "../../../configs/constants/number.constants"
const USE_READ_REPLICA = false;

class PostModel extends DatabaseModel{

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

        return { posts: result.rows };
    };


    createNewPost = async (post_details: CreatePostType): Promise<{ title_id?: number }> => {
        const user_post = [
            [post_details.user_id, post_details.title, post_details.description,]
        ];

        const insert_post_details = format(`
            INSERT INTO user_stories.posts (user_id, title, description)
            VALUES %L
            RETURNING *;
            `, user_post
        );

        const result = await this.executeQuery<{ id: number }>(insert_post_details);

        return { title_id: result.rows[0]?.id };
    };

}

export default PostModel;