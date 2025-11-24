import { CreateSubTopic } from "../entities/types/sub_topic.type";
import { ResponseDataInterface } from "../entities/interfaces/global.interface";
import SubTopic from "../models/sub_topic.model";

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
    createSubTopic = async (params: CreateSubTopic): Promise<ResponseDataInterface<CreateSubTopic>> => {
        const response_data: ResponseDataInterface<CreateSubTopic> = { status: false, error: null, result: undefined };

        try {
            const new_sub_topic = { ...params };

            if (!new_sub_topic.name) {
                response_data.error = "Sub-Topic Name is required.";
                return response_data;
            }

            const post_topic_model = new SubTopic();
            const { posts } = await post_topic_model.fetchModel<{ id: number }>({
                fields_to_select: `id`,
                where_params: `name = $1`,
                where_values: [new_sub_topic.name]
            });

            if (posts.length) {
                response_data.error = "Title already exists.";
                return response_data;
            }

            const post_sub_topic = new SubTopic();
            const { sub_topic_id } = await post_sub_topic.createNewSubTopic(new_sub_topic);

            if (!sub_topic_id) {
                response_data.error = "Failed to create Sub-Topic record.";
                return response_data;
            }

            response_data.status = true;
            response_data.result = { ...new_sub_topic, id: sub_topic_id };
        }
        catch (error: any) {
            response_data.error = error.message;
        }

        return response_data;
    };

    getAllSubTopic = async (): Promise<ResponseDataInterface<CreateSubTopic[]>> => {
        const response_data: ResponseDataInterface<CreateSubTopic[]> = { status: false, result: undefined, error: null };

        try {
            const post_model = new SubTopic();
            const post_result = await post_model.fetchModel<CreateSubTopic>({
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
        catch (error: any) {
            response_data.error = error.message;
        }

        return response_data;
    };
}

export default UserSubTopic;