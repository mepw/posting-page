import { CreateTopic } from "../entities/types/topic.type";
import { ResponseDataInterface } from "../entities/interfaces/global.interface";
import PostTopic from "../models/topic.model";

class UserSubTopic {
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

        try {
            const new_user_post = params;

            if (!new_user_post.name) {
                response_data.error = "name is required.";
                return response_data;
            }

            if (!new_user_post.user_id) {
                response_data.error = "name is required.";
                return response_data;
            }


            const post_topic_model = new PostTopic();
            const { posts } = await post_topic_model.fetchModel<{ id: number }>({
                fields_to_select: `id`,
                where_params: `name = $1`,
                where_values: [new_user_post.name]
            });

            if (posts.length) {
                response_data.error = "Title already exists.";
                return response_data;
            }

            const { topic_id } = await post_topic_model.createNewTopic(new_user_post);

            if (!topic_id) {
                response_data.error = "Failed to create user record.";
                return response_data;
            }

            response_data.status = true;
            response_data.result = { ...new_user_post, id: topic_id };
        }
        catch (error: any) {
            response_data.error = error.message;
        }

        return response_data;
    };

    getAllTopic = async (): Promise<ResponseDataInterface<CreateTopic[]>> => {
        const response_data: ResponseDataInterface<CreateTopic[]> = { status: false, result: undefined, error: null };

        try {
            const post_model = new PostTopic();
            const post_result = await post_model.fetchModel<CreateTopic>({
                fields_to_select: `
                   *
                `,
                join_statement: `
                `,
                order_by: `id DESC`
            });

            response_data.status = true;
            response_data.result = post_result.posts;
        }
        catch (error: any){
            response_data.error = error.message;
        }

        return response_data;
    };

}

export default UserSubTopic;