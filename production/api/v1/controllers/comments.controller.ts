import CommentService from "../services/comment.service"
import { ResponseDataInterface } from "../entities/interfaces/global.interface"
import { CreatePostComment } from "../entities/types/comment.type";
import { RESPONSE_DATA_DEFAULT_VALUE } from "../../../configs/constants/app.constant";
import { Request, Response } from "express-serve-static-core";

class PostCommentController {
    /**
     * DOCU: This function creates a new comment for a post. <br>
     *       It merges the validated user ID with the request body, sends it to the comment service,
     *       and returns the response as JSON. <br>
     * Last updated at: Nov 20, 2025 <br>
     * @param req - Express Request object containing validated user data and comment body
     * @param res - Express Response object used to send the JSON response
     * @returns response_data - JSON containing status, created comment result, and/or error message
     * @author Keith
     */
    createComment = async (req: Request, res: Response): Promise<void> => {
        const user_id = req.validated_user_data?.id;
        const comment_service = new CommentService();

        try {
            const comment_data: CreatePostComment = {
                ...req.body,
                post_id: req.body.post_id,
                user_id
            };

            console.log(" received body:", req.body, "user_id:", comment_data);
            const response_data: ResponseDataInterface<CreatePostComment> = await comment_service.createNewComment(comment_data);
            console.log(" response data:", response_data);
            res.json(response_data);
        }
        catch (error: any) {
            res.json({ ...RESPONSE_DATA_DEFAULT_VALUE, status: false, error: error.message });
        }
    };



}

export default new PostCommentController();