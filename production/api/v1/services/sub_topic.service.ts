import { CreateSubTopic, DeleteSubTopicType} from "../entities/types/sub_topic.type";
import { ResponseDataInterface } from "../entities/interfaces/global.interface";
import SubTopic from "../models/sub_topic.model";


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
    createSubTopic = async (params: CreateSubTopic): Promise<ResponseDataInterface<CreateSubTopic>> => {
        const response_data: ResponseDataInterface<CreateSubTopic> = { status: false, error: null, result: undefined };

        try{
            const new_sub_topic = { ...params };

            if(!new_sub_topic.name){
                response_data.error = "Sub-Topic Name is required.";
            }

            const post_topic_model = new SubTopic();
            const { posts } = await post_topic_model.fetchModel<{ id: number }>({
                fields_to_select: `id`,
                where_params: `name = $1`,
                where_values: [new_sub_topic.name]
            });

            if(posts.length){
               throw new Error("Sub-Topic with this name already exists.");
            }

            const post_sub_topic = new SubTopic();
            const { sub_topic_id } = await post_sub_topic.createNewSubTopic(new_sub_topic);
            
            if(!sub_topic_id){
                throw new Error("Failed to create sub-topic.");
            }

            response_data.status = true;
            response_data.result = { ...new_sub_topic, id: sub_topic_id };
        }
        catch(error){
            response_data.error = (error as Error).message || 'error in service sub-topic';
        }

        return response_data;
    };

    getAllSubTopic = async (): Promise<ResponseDataInterface<CreateSubTopic[]>> => {
        const response_data: ResponseDataInterface<CreateSubTopic[]> = { status: false, error: null, result: undefined };

        try{
            const sub_topic = new SubTopic();
            const post_result = await sub_topic.fetchModel<CreateSubTopic>({
                fields_to_select: `
                   *
                `,
            });

            response_data.status = true;
            response_data.result = post_result.posts;
        }
        catch(error){
            response_data.error = (error as Error).message || 'error in service get all sub-topic';
        }

        return response_data;
    };
    
    deleteSubTopic = async (params: DeleteSubTopicType): Promise<ResponseDataInterface<boolean>> => {
        const response_data: ResponseDataInterface<boolean> = { status: false, error: null, result: undefined };
        const sub_topic_model = new SubTopic();
        const id = params.id;

        try{
            const delete_result = await sub_topic_model.deleteSubTopic(
                `id = $1`,
                [id]
            );

            if(!delete_result){
                throw new Error("Failed to delete sub-topic.");
            }

            response_data.status = true;
            response_data.result = delete_result;
        }
        catch(error){
            response_data.error = (error as Error).message || 'error in service delete sub-topic';
        }

        return response_data;
    };
}

export default UserSubTopic;