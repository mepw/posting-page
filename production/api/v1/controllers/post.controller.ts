import postService from "../services/post.service"
import { ResponseDataInterface } from "../entities/interfaces/global.interface"
import { CreatePostType } from "../entities/types/post.type";
import { RESPONSE_DATA_DEFAULT_VALUE } from "../../../configs/constants/app.constant";
import { Request, Response } from "express-serve-static-core";

class PostController {

    createPost = async (req: Request, res: Response): Promise<void> => {
        const user_id = req.validated_user_data?.id; 
        const post_service = new postService();

        try {
            const post_data: CreatePostType = {...req.body,user_id, };
            const response_data: ResponseDataInterface<CreatePostType> = await post_service.createPost(post_data);
            res.json(response_data);
        }
        catch (error: any) {
            res.json({ ...RESPONSE_DATA_DEFAULT_VALUE, status: false, error: error.message, });
        }
    };

    getAllPost = async (req: Request, res: Response): Promise<void> => {
        const post_service = new postService();

        try {
            
            const response_data: ResponseDataInterface<CreatePostType[]> = await post_service.getAllPost();
            res.json(response_data);
        }
        catch (error: any) {
            res.json({ ...RESPONSE_DATA_DEFAULT_VALUE, status: false, error: error.message, });
        }
    }
}

export default new PostController();