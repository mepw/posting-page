import SubTopicModel from "../services/sub_topic.service"
import { ResponseDataInterface } from "../entities/interfaces/global.interface"
import { RESPONSE_DATA_DEFAULT_VALUE } from "../../../configs/constants/app.constant";
import { Request, Response } from "express-serve-static-core";
import { CreateSubTopic, DeleteSubTopicType } from "../entities/types/sub_topic.type";
class PostSubTopicController {
    /**
     * DOCU: This function creates a new comment for a post. 
     *       It merges the validated user ID with the request body, sends it to the comment service,
     *       and returns the response as JSON. 
     * Last updated at: Nov 20, 2025 
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

            if(!new_sub_topics.name){
                res.json({ status: false, error: "Sub-Topic Name is required." });
                return;
            }

            const response_data: ResponseDataInterface<CreateSubTopic> = await subTopicService.createSubTopic(new_sub_topics);
            res.json(response_data);
        }
        catch(error){
            res.json({ status: false, error: (error as Error).message || 'error in creating sub-topic', });
        }
    };

    /**
     * DOCU: This function retrieves all sub-topics. 
     *       It calls the SubTopicModel service to fetch all sub-topic records
     *       and returns the result as JSON. 
     * Last updated at: Dec 3, 2025 
     * @param req - Express Request object
     * @param res - Express Response object used to send the JSON response
     * @returns response_data - JSON containing status, sub-topic list, and/or error message
     * @author Keith
     */
    getAllSubTopic = async (req: Request, res: Response): Promise<void> => {
        const post_service = new SubTopicModel();

        try{
            const response_data: ResponseDataInterface<CreateSubTopic[]> = await post_service.getAllSubTopic();
            res.json(response_data);
        }
        catch(error){
            res.json({ ...RESPONSE_DATA_DEFAULT_VALUE, status: false, error: (error as Error).message || 'error in getting sub-topics', });
        }
    }
    
    /**
     * DOCU: This function deletes a specific sub-topic. 
     *       It validates the user ID, extracts the sub-topic ID from the request parameters,
     *       calls the SubTopicModel service to delete the sub-topic, and returns the result as JSON. 
     * Last updated at: Dec 3, 2025 
     * @param req - Express Request object containing validated user data and sub-topic ID in params
     * @param res - Express Response object used to send the JSON response
     * @returns response_data - JSON containing status of deletion and/or error message
     * @throws Error - Throws "Unauthorized" if the user ID is not found in the request
     * @author Keith
     */
    deleteSubTopic = async (req: Request, res: Response): Promise<void> => {
        try{
            const sub_topic_service = new SubTopicModel();
            const sub_topic_data: DeleteSubTopicType = { id: Number(req.params.id), user_id: Number(req.validated_user_data?.id) };
            const response_data: ResponseDataInterface<boolean | null> = await sub_topic_service.deleteSubTopic(sub_topic_data);
            res.json(response_data);
        }
        catch(error){
            res.json({ ...RESPONSE_DATA_DEFAULT_VALUE, error: (error as Error).message || 'error in deleting sub-topic', });
        }
    };
}

export default new PostSubTopicController();