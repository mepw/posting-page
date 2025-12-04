import { CreateTopic, DeleteTopicType } from "../entities/types/topic.type";
import { ResponseDataInterface } from "../entities/interfaces/global.interface";
import PostTopic from "../models/topic.model";

class UserSubTopic{
    /**
     * DOCU: This function handles creating a new comment record in the database. 
     *       It validates the input, calls the CommentModel to insert the comment, and
     *       returns the result along with a status. If an error occurs, the response contains the error message. 
     * Last updated at: Nov 20, 2025 
     * @param params - Object containing comment data and user_id
     * @returns response_data - JSON containing status, created comment result, and/or error message
     * @author Keith
     */
    createNewTopics = async (params: CreateTopic): Promise<ResponseDataInterface<CreateTopic>> => {
        const response_data: ResponseDataInterface<CreateTopic> = { status: false, error: null, result: undefined };

        try{
            const post_topic_model = new PostTopic();
            const { new_topics } = await post_topic_model.fetchModel<{ id: number }>({
                fields_to_select: `id`,
                where_params: `name = $1`,
                where_values: [params.name]
            });

            if(new_topics.length){
                throw new Error("Topic with this name already exists.");
            }

            const { topic_id } = await post_topic_model.createNewTopic(params);

            if(!topic_id){
                throw new Error("Failed to create topic.");
            }
            else{
                response_data.status = true;
                response_data.result = { ...params, id: topic_id };
            }
        }
        catch(error){
            response_data.error = (error as Error).message || 'error in service create topic';
        }

        return response_data;
    };
    
    /**
     * DOCU: This function fetches all topics from the database. 
     *       It uses the PostTopic model to retrieve all topic records. If no topics are found,
     *       an error is returned. The response includes the status, result (array of topics), 
     *       and any error message. 
     * Last updated at: Dec 3, 2025 
     * @returns response_data - JSON containing status, array of topics (result), and/or error message
     * @author Keith
     */
    getAllTopic = async (): Promise<ResponseDataInterface<CreateTopic[]>> => {
        const response_data: ResponseDataInterface<CreateTopic[]> = { status: false, error: null, result: undefined };

        try{
            const topic_model = new PostTopic();
            const topic_result = await topic_model.fetchModel<CreateTopic>({
                fields_to_select: `*`,
            });

            if(!topic_result.new_topics.length){
                throw new Error("No topics found.");
            }
            else{
                response_data.status = true;
                response_data.result = topic_result.new_topics;
            }
        }
        catch(error){
            response_data.error = (error as Error).message || 'error in service get all topic';
        }

        return response_data;
    };
    
    /**
     * DOCU: This function deletes a specific topic from the database by ID. 
     *       It uses the PostTopic model to perform the deletion. If deletion fails, an error 
     *       is returned. The response includes the status, deletion result (true/false), 
     *       and any error message. 
     * Last updated at: Dec 3, 2025 
     * @param params - Object containing the `id` of the topic to be deleted
     * @returns response_data - JSON containing status, deletion result, and/or error message
     * @author Keith
     */
    deleteTopic = async (params: DeleteTopicType): Promise<ResponseDataInterface<boolean>> => {
        const response_data: ResponseDataInterface<boolean> = { status: false, error: null, result: undefined };
        
        try{
            const topic_model = new PostTopic();
            const id = params.topic_id;
            const delete_topic_result = await topic_model.deleteTopic(
                `id = $1`,
                [id]
            );

            if(!delete_topic_result){
                throw new Error("Failed to delete topic.");
            }
            else{
                response_data.status = true;
                response_data.result = delete_topic_result;
            }
        } 
        catch(error){
            response_data.error = (error as Error).message || 'error in service delete topic';
        }

        return response_data;
    };
}

export default UserSubTopic;