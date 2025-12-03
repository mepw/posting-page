import { CreateTopic, DeleteTopicType } from "../entities/types/topic.type";
import { ResponseDataInterface } from "../entities/interfaces/global.interface";
import PostTopic from "../models/topic.model";
import { ERROR_CATCH_MESSAGE } from "../../../configs/constants/user_validation.constant"

class UserSubTopic{
    /**
     * DOCU: This function handles creating a new comment record in the database. <br>
     *       It validates the input, calls the CommentModel to insert the comment, and
     *       returns the result along with a status. If an error occurs, the response contains the error message. <br>
     * Last updated at: Nov 20, 2025 <br>
     * @param params - Object containing comment data and user_id
     * @returns response_data - JSON containing status, created comment result, and/or error message
     * @author Keith
     */
    createNewTopics = async (params: CreateTopic): Promise<ResponseDataInterface<CreateTopic>> => {
        const response_data: ResponseDataInterface<CreateTopic> = { status: false, error: null, result: undefined };

        try{
            const new_user_topic = params;
            const post_topic_model = new PostTopic();
            const { new_topics } = await post_topic_model.fetchModel<{ id: number }>({
                fields_to_select: `id`,
                where_params: `name = $1`,
                where_values: [new_user_topic.name]
            });

            if(new_topics.length){
                throw new Error("Topic with this name already exists.");
            }

            const { topic_id } = await post_topic_model.createNewTopic(new_user_topic);

            if(!topic_id){
                throw new Error("Failed to create topic.");
            }

            response_data.status = true;
            response_data.result = { ...new_user_topic, id: topic_id };
        }
        catch(error){
            response_data.error = (error as Error).message || 'error in service create topic';
        }

        return response_data;
    };

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

            response_data.status = true;
            response_data.result = topic_result.new_topics;
        }
        catch(error){
            response_data.error = (error as Error).message || 'error in service get all topic';
        }

        return response_data;
    };

    deleteTopic = async (params: DeleteTopicType): Promise<ResponseDataInterface<boolean>> => {
        const response_data: ResponseDataInterface<boolean> = { status: false, error: null, result: undefined };
        const topic_model = new PostTopic();
        const id = params.id;

        try{
            const delete_topic_result = await topic_model.deleteTopic(
                `id = $1`,
                [id]
            );
            
            if(!delete_topic_result){
                throw new Error("Failed to delete topic.");
            }

            response_data.status = true;
            response_data.result = delete_topic_result;
        } 
        catch(error){
            response_data.error = (error as Error).message || 'error in service delete topic';
        }

        return response_data;
    };
}

export default UserSubTopic;