import TopicService from "../services/topic.service"
import { ResponseDataInterface } from "../entities/interfaces/global.interface"
import { CreateTopic } from "../entities/types/topic.type";
import { RESPONSE_DATA_DEFAULT_VALUE } from "../../../configs/constants/app.constant";
import { Request, Response } from "express-serve-static-core";

class PostTopicController {
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
    createPostTopic = async (req: Request, res: Response): Promise<void> => {
     const user_id = req.validated_user_data?.id;
        const post_topic_service = new TopicService();

        try {
            const post_topics: CreateTopic = { ...req.body, user_id, };
            const response_data: ResponseDataInterface<CreateTopic> = await post_topic_service.createNewTopics(post_topics);
            res.json(response_data);
        }
        catch (error: any) {
            res.json({ ...RESPONSE_DATA_DEFAULT_VALUE, status: false, error: error.message, });
        }
    };

    getAllTopic = async (req: Request, res: Response): Promise<void> => {
        const post_service = new TopicService();

        try {
            const response_data: ResponseDataInterface<CreateTopic[]> = await post_service.getAllTopic();
            res.json(response_data);
        }
        catch (error: any) {
            res.json({ ...RESPONSE_DATA_DEFAULT_VALUE, status: false, error: error.message, });
        }
    }
}

export default new PostTopicController();