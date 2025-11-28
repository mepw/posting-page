import postService from "../services/post.service"
import { ResponseDataInterface } from "../entities/interfaces/global.interface"
import { CreatePostType, DeletePostType, UpdatePostType } from "../entities/types/post.type";
import { RESPONSE_DATA_DEFAULT_VALUE } from "../../../configs/constants/app.constant";
import { Request, Response } from "express-serve-static-core";
import { ERROR_CATCH_MESSAGE } from "../../../configs/constants/user_validation.constant"
class PostController {
    /**
     * DOCU: This is function helper to send a request to other server/service. <br>
     * Last updated at: Nov 20, 2025 <br>
     * @param token - Bearer token
     * @param url - URL to make the request
     * @param method - Method type of the request
     * @param data - The body or payload of the request
     * @returns reference_number - string
     * @author Keith
     */
    createPost = async (req: Request, res: Response): Promise<void> => {
        const user_id = req.validated_user_data?.id;
        const post_service = new postService();

        try {
            const post_data: CreatePostType = {
                ...req.body,
                user_id,
                post_topic_id: req.body.post_topic_id,
                post_sub_topic_id: req.body.post_sub_topic_id,
            };

            const response_data = await post_service.createPost(post_data);
            res.json(response_data);
        }
        catch (error) {
            res.json({ ...RESPONSE_DATA_DEFAULT_VALUE, error: ERROR_CATCH_MESSAGE.error });
        }
    };

    /**
     * DOCU: This function retrieves all posts by calling the post service. <br>
     *       Returns the response data as JSON. If an error occurs, returns a default
     *       error response with the error message. <br>
     * Last updated at: Nov 20, 2025 <br>
     * @param req - Express Request object
     * @param res - Express Response object used to send the JSON response
     * @returns response_data - JSON containing status, result (array of posts), and/or error message
     * @author Keith
     * @updated_at November 20
     */
    getAllPost = async (req: Request, res: Response): Promise<void> => {
        const post_service = new postService();

        try{
            const { sorting_data } = req.query;
            const response_data = await post_service.getAllPost(sorting_data as string);
            res.json(response_data);
        }
        catch(error){
            res.json({ ...RESPONSE_DATA_DEFAULT_VALUE, error: ERROR_CATCH_MESSAGE.error });
        }
    };


    /**
     * DOCU: This function updates an existing post by merging the request body with the post ID
     *       from the request parameters and sending it to the post service. <br>
     *       Returns the updated post data as JSON. <br>
     * Last updated at: Nov 20, 2025 <br>
     * @param req - Express Request object containing post body and post ID in params
     * @param res - Express Response object used to send the JSON response
     * @returns response_data - JSON containing status, updated post result, and/or error message
     * @author Keith
     */
    updatePost = async (req: Request, res: Response): Promise<void> => {
        const post_service = new postService();

        try{
            const post_id = Number(req.params.id);
            const post_data: UpdatePostType = { ...req.body, id: post_id };

            const response_data = await post_service.updatePost(post_data);
            res.json(response_data);
        }
        catch(error){
            res.json({ ...RESPONSE_DATA_DEFAULT_VALUE, error: ERROR_CATCH_MESSAGE.error });
        }
    };

    /**
     * DOCU: This function deletes a post for the authenticated user. <br>
     *       It verifies the user ID from the request, constructs the delete payload with post ID,
     *       calls the post service to delete the post, and returns the response as JSON. <br>
     * Last updated at: Nov 20, 2025 <br>
     * @param req - Express Request object containing post ID in params and validated user data
     * @param res - Express Response object used to send the JSON response
     * @returns response_data - JSON containing status (true/false) and/or error message
     * @author Keith
     */
    deletePost = async (req: Request, res: Response): Promise<void> => {
        const post_service = new postService();
        const user_id = req.validated_user_data?.id;

        if(!user_id){
            throw new Error("Unauthorized")
        }

        const post_id = Number(req.params.id);

        try{
            const post_data: DeletePostType = { id: post_id, user_id };
            const response_data: ResponseDataInterface<boolean | null> = await post_service.deleteUserPost(post_data);
            res.json(response_data);
        }
        catch(error){
            res.json({ ...RESPONSE_DATA_DEFAULT_VALUE, error: ERROR_CATCH_MESSAGE.error });
        }
    };

}

export default new PostController();