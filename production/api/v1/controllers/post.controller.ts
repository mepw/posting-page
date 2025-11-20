import postService from "../services/post.service"
import { ResponseDataInterface } from "../entities/interfaces/global.interface"
import { CreatePostType, DeletePostType, UpdatePostType } from "../entities/types/post.type";
import { RESPONSE_DATA_DEFAULT_VALUE } from "../../../configs/constants/app.constant";
import { Request, Response } from "express-serve-static-core";

class PostController {

    createPost = async (req: Request, res: Response): Promise<void> => {
        const user_id = req.validated_user_data?.id;
        const post_service = new postService();

        try {
            const post_data: CreatePostType = { ...req.body, user_id, };
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

    updatePost = async (req: Request, res: Response): Promise<void> => {
        const post_service = new postService();

        try {
            const post_id = Number(req.params.id);
            const post_data: UpdatePostType = { ...req.body, id: post_id }; 
            const response_data = await post_service.updatePost(post_data);
            res.json(response_data);
        }
        catch (error: any) {
            res.json({ status: false, error: error.message });
        }
    };

    deletePost = async (req: Request, res: Response): Promise<void> => {
        const post_service = new postService();
        const user_id = req.validated_user_data?.id;

        if (!user_id) {
            throw new Error("Unauthorized")
        }

        const post_id = Number(req.params.id);

        try {
            const post_data: DeletePostType = { id: post_id, user_id };
            const response_data: ResponseDataInterface<boolean> = await post_service.deleteUserPost(post_data);
            res.json(response_data);
        }
        catch (error: any) {
            res.json({ ...RESPONSE_DATA_DEFAULT_VALUE, status: false, error: error.message, });
        }
    };




}

export default new PostController();