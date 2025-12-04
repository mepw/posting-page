import { CreateSubTopic, DeleteSubTopicType} from "../entities/types/sub_topic.type";
import { ResponseDataInterface } from "../entities/interfaces/global.interface";
import SubTopic from "../models/sub_topic.model";


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
    createSubTopic = async (params: CreateSubTopic): Promise<ResponseDataInterface<CreateSubTopic>> => {
        const response_data: ResponseDataInterface<CreateSubTopic> = { status: false, error: null, result: undefined };

        try{
            const post_topic_model = new SubTopic();
            const { posts } = await post_topic_model.fetchModel<{ id: number }>({
                fields_to_select: `id`,
                where_params: `name = $1`,
                where_values: [params.name]
            });

            if(posts.length){
               throw new Error("Sub-Topic with this name already exists.");
            }

            const post_sub_topic = new SubTopic();
            const { sub_topic_id } = await post_sub_topic.createNewSubTopic(params);
            
            if(!sub_topic_id){
                throw new Error("Failed to create sub-topic.");
            }
            else{
                response_data.status = true;
                response_data.result = { ...params, id: sub_topic_id };
            }
        }
        catch(error){
            response_data.error = (error as Error).message || 'error in service sub-topic';
        }

        return response_data;
    };

    /**
     * DOCU: This function retrieves all sub-topic records from the database. 
     *       It creates a SubTopic instance, fetches all fields of sub-topic records,
     *       and returns them along with a status. If an error occurs, the response
     *       contains the error message. 
     * Last updated at: Dec 3, 2025 
     * @returns response_data - JSON containing status, an array of sub-topic records, and/or error message
     * @author Keith
     */
    getAllSubTopic = async (): Promise<ResponseDataInterface<CreateSubTopic[]>> => {
        const response_data: ResponseDataInterface<CreateSubTopic[]> = { status: false, error: null, result: undefined };

        try{
            const sub_topic = new SubTopic();
            const post_result = await sub_topic.fetchModel<CreateSubTopic>({
                fields_to_select: `
                   *
                `,
            });

            if(!post_result.posts.length){
                throw new Error("No sub-topics found.");
            }
            else{
                response_data.status = true;
                response_data.result = post_result.posts;
            }
        }
        catch(error){
            response_data.error = (error as Error).message || 'error in service get all sub-topic';
        }

        return response_data;
    };
    
    /**
     * DOCU: This function deletes a sub-topic record based on the provided ID. 
     *       It validates the input, calls the SubTopic model to delete the record,
     *       and returns a boolean result along with a status. If deletion fails or
     *       an error occurs, the response contains the error message. 
     * Last updated at: Dec 3, 2025 
     * @param params - Object containing the ID of the sub-topic to be deleted
     * @returns response_data - JSON containing status, deletion result (true/false), and/or error message
     */
    deleteSubTopic = async (params: DeleteSubTopicType): Promise<ResponseDataInterface<boolean>> => {
        const response_data: ResponseDataInterface<boolean> = { status: false, error: null, result: undefined };

        try{
            const sub_topic_model = new SubTopic();
            const delete_result = await sub_topic_model.deleteSubTopic(
                `id = $1`,
                [params.id]
            );

            if(!delete_result){
                throw new Error("Failed to delete sub-topic.");
            }
            else{
                response_data.status = true;
                response_data.result = delete_result;
            }
        }
        catch(error){
            response_data.error = (error as Error).message || 'error in service delete sub-topic';
        }

        return response_data;
    };
}

export default UserSubTopic;