import TopicService from "../services/topic.service"
import { ResponseDataInterface } from "../entities/interfaces/global.interface"
import { CreateTopic, DeleteTopicType} from "../entities/types/topic.type";
import { RESPONSE_DATA_DEFAULT_VALUE } from "../../../configs/constants/app.constant";
import { Request, Response } from "express-serve-static-core";
import { NUMBERS } from "../../../configs/constants/number.constants";

class PostTopicController {
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
    createPostTopic = async (req: Request, res: Response): Promise<void> => {

        try{
            const user_id = req.validated_user_data?.id;
            const post_topic_service = new TopicService();
            const post_topics: CreateTopic = { ...req.body, user_id, };
            const response_data: ResponseDataInterface<CreateTopic | null> = await post_topic_service.createNewTopics(post_topics);
            res.json(response_data);
        }
        catch(error){
            res.json({ ...RESPONSE_DATA_DEFAULT_VALUE, status: false, error: (error as Error).message || 'error in creating topic', });
        }
        
    };
    
    /**
     * DOCU: This function retrieves all topics from the TopicService. 
     *       It calls the service method `getAllTopic` and returns the response as JSON. 
     * Last updated at: Dec 3, 2025 
     * @param req - Express Request object
     * @param res - Express Response object used to send the JSON response
     * @returns response_data - JSON containing status, topics list, and/or error message
     * @author Keith
     */
    getAllTopic = async (req: Request, res: Response): Promise<void> => {
        
        try{
            const post_service = new TopicService();
            const response_data: ResponseDataInterface<CreateTopic[] | null> = await post_service.getAllTopic();
            res.json(response_data);
        }
        catch(error){
            res.json({ ...RESPONSE_DATA_DEFAULT_VALUE, status: false, error: (error as Error).message || 'error in getting topics', });
        }

    }
    
    /**
     * DOCU: This function deletes a specific topic. 
     *       It retrieves the user ID from validated user data and topic ID from request parameters, 
     *       calls the TopicService's `deleteTopic` method, and returns the response as JSON. 
     * Last updated at: Dec 3, 2025 
     * @param req - Express Request object containing validated user data and topic ID in params
     * @param res - Express Response object used to send the JSON response
     * @returns response_data - JSON containing status of deletion and/or error message
     * @throws Error - Throws "Unauthorized" if the user ID is missing
     * @author Keith
     */
    deleteTopic = async (req: Request, res: Response): Promise<void> => {
        
        try{
            const topic_service = new TopicService();

            if(!req.validated_user_data?.id || !req.params.id){
                throw new Error("Unauthorized or missing topic id");
            }
            
            const topic_data: DeleteTopicType = { topic_id: Number(req.params.id), user_id:req.validated_user_data?.id };
            const response_data: ResponseDataInterface<boolean | null> = await topic_service.deleteTopic(topic_data);
            res.json(response_data);
        }
        catch(error){
            res.json({ ...RESPONSE_DATA_DEFAULT_VALUE, error: (error as Error).message || 'error in deleting topic' });
        }
    };
    
}

export default new PostTopicController();