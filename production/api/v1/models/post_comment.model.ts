
import DatabaseModel from "./database.model";
import format from "pg-format"
import { CreatePostComment } from "../entities/types/comment.type";

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
    createNewComment = async (post_comments: CreatePostComment): Promise<{ id: number; post_id: number }> => {
        const comment_values = [[post_comments.user_id, post_comments.post_id, post_comments.comment]];

        const insert_query = format(`
                INSERT INTO user_stories.post_comments(user_id, post_id, comment)
                VALUES %L
                RETURNING id, post_id;
            `, comment_values
        );

        const result = await this.executeQuery<{ id: number; post_id: number }>(insert_query);
        return { id: result.rows[0].id, post_id: result.rows[0].post_id };
    };

}

export default PostComment;