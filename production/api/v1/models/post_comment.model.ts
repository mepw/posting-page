import DatabaseModel from "./database.model";
import format from "pg-format"
import { CreatePostComment } from "../entities/types/comment.type";

class PostComment extends DatabaseModel {

    createNewComment = async (post_comments: CreatePostComment): Promise<{ user_id?: number, comment_id: number }> => {
        const user_post_comment = [
            [post_comments.user_id, post_comments.post_id, post_comments.comment]
        ];

        const insert_post_comments = format(`
            INSERT INTO user_stories.post_comments(user_id, post_id, comment)
            VALUES %L
            RETURNING id;
            `, user_post_comment
        );

        const post_comment_result = await this.executeQuery<{ id: number }>(insert_post_comments);
        return { user_id: post_comment_result.rows[0]?.id, comment_id: post_comment_result.rows[0]?.id };
    };


}

export default PostComment;