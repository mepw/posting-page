import { CreatePostComment } from "../entities/types/comment.type";
import { ResponseDataInterface } from "../entities/interfaces/global.interface";
import CommentModel from "../models/post_comment.model";


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
    createNewComment = async ( params: CreatePostComment): Promise<ResponseDataInterface<CreatePostComment>> => {
        const response_data: ResponseDataInterface<CreatePostComment> = { status: false, error: null, result: undefined };

        try {
            const post_comment = new CommentModel();
            const { id, post_id } = await post_comment.createNewComment(params);
            
            if(!id || !post_id){
                throw new Error("Failed to create comment.");
            }
            else{
                response_data.status = true;
                response_data.result = { id, user_id: params.user_id, post_id, comment: params.comment };
            }
        } 
        catch(error){
            response_data.error = (error as Error).message || 'error in service create comment';
        }

        return response_data;
    };

}

export default UserComment;