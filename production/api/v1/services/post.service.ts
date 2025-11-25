import PostModel from "../models/post.model";
import { CreatePostType, UpdatePostType, DeletePostType } from "../entities/types/post.type";
import { ResponseDataInterface } from "../entities/interfaces/global.interface";

class UserPost extends PostModel {
    /**
     * DOCU: This function creates a new post record. <br>
     *       It validates the title, checks for duplicates, calls the PostModel to insert the post,
     *       and returns the created post along with status. <br>
     * Last updated at: Nov 20, 2025 <br>
     * @param params - Object containing post data including title, description, and user_id
     * @returns response_data - JSON containing status, created post result, and/or error message
     * @author Keith
     */
    createPost = async (params: CreatePostType): Promise<ResponseDataInterface<CreatePostType>> => {
        const response_data: ResponseDataInterface<CreatePostType> = { status: false, error: null, result: undefined };

        try {
            const new_user_post = { ...params };
            if (!new_user_post.title) {
                response_data.error = "Title is required.";
                return response_data;
            }

            const post_model = new PostModel();
            const { posts } = await post_model.fetchModel<{ id: number }>({
                fields_to_select: `id`,
                where_params: `title = $1`,
                where_values: [new_user_post.title],
            });

            if (posts.length) {
                response_data.error = "Title already exists.";
                return response_data;
            }

            const { post_id } = await post_model.createNewPost(new_user_post);

            if (!post_id) {
                response_data.error = "Failed to create post record.";
                return response_data;
            }

            response_data.status = true;
            response_data.result = { ...new_user_post, id: post_id };
        } catch (error: any) {
            response_data.error = error.message;
        }

        return response_data;
    };


    /**
     * DOCU: This function retrieves all posts along with user and comment details. <br>
     *       It calls the PostModel to fetch the posts and returns them with status. <br>
     * Last updated at: Nov 20, 2025 <br>
     * @returns response_data - JSON containing status, array of posts with user/comments, and/or error message
     * @author Keith
     */
    getAllPost = async (): Promise<ResponseDataInterface<CreatePostType[]>> => {
        const response_data: ResponseDataInterface<CreatePostType[]> = { status: false, result: undefined, error: null };

        try {
            const post_model = new PostModel();
            const post_result = await post_model.fetchModel<CreatePostType>({
                fields_to_select: `
                    posts.id AS post_id,
                    posts.user_id AS post_user_id,
                    posts.title,
                    posts.description,
                    post_topics.id AS topic_id,
                    post_topics.name AS topic_name,
                    post_sub_topics.id AS subtopic_id,
                    post_sub_topics.name AS subtopic_name,
                    users.first_name AS post_user_first_name,
                    users.last_name AS post_user_last_name,
                    post_comments.id AS comment_id,
                    post_comments.comment AS comment_text,
                    comment_user.first_name AS comment_user_first_name,
                    comment_user.last_name AS comment_user_last_name
                `,
                join_statement: `
                    INNER JOIN user_stories.users ON posts.user_id = users.id
                    LEFT JOIN user_stories.post_comments ON posts.id = post_comments.post_id
                    LEFT JOIN user_stories.post_topics ON posts.post_topic_id = post_topics.id
                    LEFT JOIN user_stories.post_sub_topics ON posts.post_sub_topic_id = post_sub_topics.id
                    LEFT JOIN user_stories.users AS comment_user ON post_comments.user_id = comment_user.id
                `,
                order_by: `post_topics.id DESC`
            });

            response_data.status = true;
            response_data.result = post_result.posts;
        }
        catch (error: any) {
            response_data.error = error.message;
        }

        return response_data;
    };

    /**
     * DOCU: This function updates an existing post. <br>
     *       It constructs the updated post object, calls the PostModel to update the record,
     *       and returns the updated post along with status. <br>
     * Last updated at: Nov 20, 2025 <br>
     * @param params - Object containing post ID, title, and description
     * @returns response_data - JSON containing status, updated post result, and/or error message
     * @author Keith
     */
    updatePost = async (params: UpdatePostType): Promise<ResponseDataInterface<UpdatePostType>> => {
        const response_data: ResponseDataInterface<UpdatePostType> = { status: false, error: null, result: undefined };

        const post_model = new PostModel();

        const title = params.title ?? "";
        const description = params.description ?? "";

        const updated_post: UpdatePostType = {
            id: params.id,
            title,
            description
        };

        try {
            const update_post_result = await post_model.updateUserPost(
                `title = $1, description = $2`,
                `id = $3`,
                [title, description],
                [params.id]
            );


            if (!update_post_result) {
                throw new Error("update not succesfully");
            }

            response_data.status = true;
            response_data.result = updated_post;
        }
        catch (error: any) {
            response_data.error = error.message;
        }

        return response_data;
    };

    /**
     * DOCU: This function deletes a post by ID. <br>
     *       It calls the PostModel to delete the post and returns a boolean result along with status. <br>
     * Last updated at: Nov 20, 2025 <br>
     * @param params - Object containing post ID
     * @returns response_data - JSON containing status, deletion result (true/false), and/or error message
     * @author Keith
     */
    deleteUserPost = async (params: DeletePostType): Promise<ResponseDataInterface<boolean>> => {
        const response_data: ResponseDataInterface<boolean> = {
            status: false,
            error: null,
            result: undefined
        };

        const post_model = new PostModel();
        const post_id = params.id;

        try {
            const delete_result = await post_model.deletePost(
                `id = $1`,
                [post_id]
            );

            response_data.status = true;
            response_data.result = delete_result;
        } catch (error: any) {
            response_data.error = error.message;
        }

        return response_data;
    };
}

export default UserPost;
