import { CreatePostComment } from "../entities/types/comment.type";
import { ResponseDataInterface } from "../entities/interfaces/global.interface";
import CommentModel from "../models/post_comment.model";
import PostModel from "../models/post.model";
import { sendEmail } from "../helpers/email.helper";


class UserComment {
    /**
     * DOCU: This function handles creating a new comment record in the database. 
     *       It validates the input, calls the CommentModel to insert the comment, and
     *       returns the result along with a status. If an error occurs, the response contains the error message. 
     * Last updated at: Nov 20, 2025 
     * @param params - Object containing comment data and user_id
     * @returns response_data - JSON containing status, created comment result, and/or error message
     * @author Keith
     */
    createNewComment = async (params: CreatePostComment): Promise<ResponseDataInterface<CreatePostComment>> => {
        const response_data: ResponseDataInterface<CreatePostComment> = { status: false, error: null, result: undefined };

        try {
            const post_comment = new CommentModel();
            const { id, post_id } = await post_comment.createNewComment(params);

            if(!id || !post_id){
                throw new Error("Failed to create comment.");
            }

            const post_model = new PostModel();
            const post_owner = await post_model.fetchModel<{ user_id: number; email: string }>({
                fields_to_select: 'posts.user_id, users.email',
                join_statement: 'INNER JOIN user_stories.users users ON posts.user_id = users.id',
                where_params: 'posts.id = $1 LIMIT 1', 
                where_values: [post_id]               
            });


            const owner_email = post_owner.new_user_post[0]?.email;

            if(owner_email){await sendEmail({
                    to: owner_email,
                    subject: 'New comment on your post',
                    text: `User ${params.user_id} commented: "${params.comment}"`
                });
            }

            response_data.status = true;
            response_data.result = { id, user_id: params.user_id, post_id, comment: params.comment };
        }
        catch (error) {
            response_data.error = (error as Error).message || 'error in service create comment';
        }

        return response_data;
    };


}

export default UserComment;