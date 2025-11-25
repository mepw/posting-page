import SubTopicModel from "../services/sub_topic.service"
import { ResponseDataInterface } from "../entities/interfaces/global.interface"

import { RESPONSE_DATA_DEFAULT_VALUE } from "../../../configs/constants/app.constant";
import { Request, Response } from "express-serve-static-core";
import { CreateSubTopic } from "../entities/types/sub_topic.type";
import {ERROR_CATCH_MESSAGE} from "../../../configs/constants/user_validation.constant"
class PostSubTopicController {
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
    CreateSubTopic = async (req: Request, res: Response): Promise<void> => {
        const user_id = req.validated_user_data?.id;
        const subTopicService = new SubTopicModel();

        try {
            const new_sub_topics: CreateSubTopic = { ...req.body, user_id };

            if (!new_sub_topics.name) {
                res.json({ status: false, error: "Sub-Topic Name is required." });
                return;
            }

            const response_data: ResponseDataInterface<CreateSubTopic> = await subTopicService.createSubTopic(new_sub_topics);
            res.json(response_data);
        }
        catch (error: any) {
            res.json({ status: false, error: error.message });
        }
    };

    getAllSubTopic = async (req: Request, res: Response): Promise<void> => {
        const post_service = new SubTopicModel();

        try{
            const response_data: ResponseDataInterface<CreateSubTopic[]> = await post_service.getAllSubTopic();
            res.json(response_data);
        }
        catch(error){
            res.json({ ...RESPONSE_DATA_DEFAULT_VALUE, status: false, error: ERROR_CATCH_MESSAGE.error });
        }
    }

}

export default new PostSubTopicController();