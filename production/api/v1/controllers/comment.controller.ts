import CommentService from "../services/comment.service"
import {ResponseDataInterface} from "../entities/interfaces/global.interface"
import { CreatePostComment } from "../entities/types/comment.type";
import { RESPONSE_DATA_DEFAULT_VALUE } from "../../../configs/constants/app.constant";
import { Request, Response } from "express-serve-static-core";

class PostCommentController{

    createComment = async (req: Request, res: Response): Promise<void> => {
        const user_id = req.validated_user_data?.id; 
        const comment_service = new CommentService();

        try{
            const comment_data: CreatePostComment = {...req.body, user_id, };
            const response_data: ResponseDataInterface<CreatePostComment> = await comment_service.createNewComment(comment_data);
            res.json(response_data);
        }
        catch(error: any){
            res.json({ ...RESPONSE_DATA_DEFAULT_VALUE, status: false, error: error.message, });
        }
    };

}

export default new PostCommentController();