import { CreatePostComment } from "../entities/types/comment.type";
import { ResponseDataInterface } from "../entities/interfaces/global.interface";
import CommentModel from "../models/post_comment.model";

class UserComment {

    createNewComment = async (params: CreatePostComment): Promise<ResponseDataInterface<CreatePostComment>> => {
        const response_data: ResponseDataInterface<CreatePostComment> = { status: false, error: null, result: undefined };

        try{
            const new_user_comment = { ...params };

            if(!new_user_comment.comment){
                response_data.error = "Comment is required.";
                return response_data;
            }

            const post_comment = new CommentModel();
            const { comment_id } = await post_comment.createNewComment(new_user_comment);

            if(!comment_id){
                response_data.error = "Failed to create comment record.";
                return response_data;
            }

            response_data.status = true;
            response_data.result = { ...new_user_comment, id: comment_id };
        } 
        catch(error: any){
            response_data.error = error.message;
        }

        return response_data;
    };

}

export default UserComment;