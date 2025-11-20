import PostModel from "../models/post.model";
import { CreatePostType, UpdatePostType, DeletePostType } from "../entities/types/post.type";
import { ResponseDataInterface } from "../entities/interfaces/global.interface";

class UserPost extends PostModel {

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
                where_values: [new_user_post.title]
            });

            if (posts.length) {
                response_data.error = "Title already exists.";
                return response_data;
            }

            const { title_id } = await post_model.createNewPost(new_user_post);

            if (!title_id) {
                response_data.error = "Failed to create user record.";
                return response_data;
            }

            response_data.status = true;
            response_data.result = { ...new_user_post, id: title_id };
        } catch (error: any) {
            response_data.error = error.message;
        }

        return response_data;
    };

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
                    users.first_name AS post_user_first_name,
                    users.last_name AS post_user_last_name,
                    post_comments.id AS comment_id,
                    post_comments.comment AS comment_text,
                    comment_user.first_name AS comment_user_first_name
                `,
                join_statement: `
                    INNER JOIN user_stories.users ON posts.user_id = users.id
                    LEFT JOIN user_stories.post_comments ON posts.id = post_comments.post_id
                    LEFT JOIN user_stories.users AS comment_user ON post_comments.user_id = comment_user.id
                `,
                order_by: `posts.id DESC`
            });

            response_data.status = true;
            response_data.result = post_result.posts;
        } catch (error: any) {
            response_data.error = error.message;
        }

        return response_data;
    };

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
